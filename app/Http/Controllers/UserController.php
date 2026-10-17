<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display list of users for Administrators and Super Admins.
     */
    public function index(Request $request): Response
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin()) {
            abort(403, 'Unauthorized access to user management.');
        }

        $query = User::query()->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roles' => array_map(fn (UserRole $r) => ['value' => $r->value, 'label' => $r->label()], UserRole::cases()),
        ]);
    }

    /**
     * Create a new user (Trainee, Instructor, Administrator).
     */
    public function store(Request $request): RedirectResponse
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|in:super_admin,admin,instructor,trainee,auditor',
            'phone' => 'nullable|string|max:30',
            'password' => ['required', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        AuditService::record('user_created', 'User', $user->id, [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
        ]);

        return redirect()->back()->with('success', 'User account created successfully.');
    }

    /**
     * Update an existing user's details or role.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:super_admin,admin,instructor,trainee,auditor',
            'phone' => 'nullable|string|max:30',
            'is_active' => 'required|boolean',
            'password' => ['nullable', Password::defaults()],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'phone' => $validated['phone'],
            'is_active' => $validated['is_active'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        AuditService::record('user_updated', 'User', $user->id, [
            'role' => $user->role->value,
            'is_active' => $user->is_active,
            'password_changed' => ! empty($validated['password']),
        ]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Soft delete user.
     */
    public function destroy(User $user): RedirectResponse
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin() || $user->id === $currentUser->id) {
            abort(403, 'Cannot delete your own account or unauthorized.');
        }

        $user->delete();

        AuditService::record('user_deleted', 'User', $user->id, [
            'email' => $user->email,
        ]);

        return redirect()->back()->with('success', 'User deactivated successfully.');
    }
    /**
     * Bulk register users from an uploaded CSV file.
     */
    public function importCsv(Request $request): RedirectResponse
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('csv_file');
        $path = $file->getPathname();

        $fileHandle = fopen($path, 'r');
        if (! $fileHandle) {
            return redirect()->back()->with('error', 'Unable to open the uploaded CSV file.');
        }

        // Read and sanitize header row
        $headers = fgetcsv($fileHandle);
        if (! $headers) {
            fclose($fileHandle);
            return redirect()->back()->with('error', 'The uploaded CSV file is empty.');
        }

        $headers = array_map(function ($h) {
            return strtolower(trim(preg_replace('/[\x00-\x1F\x7F-\x9F\xEF\xBB\xBF]/', '', $h)));
        }, $headers);

        if (! in_array('name', $headers) || ! in_array('email', $headers)) {
            fclose($fileHandle);
            return redirect()->back()->with('error', 'CSV header must contain at least "name" and "email" columns.');
        }

        $importedCount = 0;
        $skippedCount = 0;
        $rowNumber = 1;

        $validRoles = array_map(fn ($r) => $r->value, UserRole::cases());

        while (($row = fgetcsv($fileHandle)) !== false) {
            $rowNumber++;
            if (count($row) !== count($headers)) {
                $skippedCount++;
                continue;
            }

            $data = array_combine($headers, $row);
            $name = trim($data['name'] ?? '');
            $email = strtolower(trim($data['email'] ?? ''));

            if (empty($name) || empty($email) || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skippedCount++;
                continue;
            }

            // Check if user already exists
            if (User::where('email', $email)->exists()) {
                $skippedCount++;
                continue;
            }

            $rawRole = strtolower(trim($data['role'] ?? 'trainee'));
            $role = in_array($rawRole, $validRoles) ? $rawRole : 'trainee';
            $phone = ! empty($data['phone']) ? trim($data['phone']) : null;
            $rawPassword = ! empty($data['password']) ? trim($data['password']) : 'Password@123';

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'phone' => $phone,
                'password' => Hash::make($rawPassword),
                'is_active' => true,
            ]);

            AuditService::record('bulk_user_imported', 'User', $user->id, [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ]);

            $importedCount++;
        }

        fclose($fileHandle);

        $msg = "CSV Import Complete: {$importedCount} user account(s) created successfully.";
        if ($skippedCount > 0) {
            $msg .= " ({$skippedCount} duplicate or invalid row(s) skipped).";
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Download sample CSV format for bulk user import.
     */
    public function downloadSampleCsv()
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="cyberlab_bulk_users_template.csv"',
        ];

        $content = "name,email,role,password,phone\n" .
                   "Trainee Abubakar,abubakar@gregco.local,trainee,Password@123,+2348011223344\n" .
                   "Trainee Fatima,fatima@gregco.local,trainee,Password@123,+2348022334455\n" .
                   "Instructor Chidi,chidi@gregco.local,instructor,Password@123,+2348033445566\n" .
                   "Security Auditor,auditor@gregco.local,auditor,Password@123,+2348044556677\n";

        return response($content, 200, $headers);
    }
}
