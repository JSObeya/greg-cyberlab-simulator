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
}
