<?php

namespace App\Http\Controllers;

use App\Models\Programme;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProgrammeController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Unauthorized access to programme management.');
        }

        $programmes = Programme::with([
            'coordinator',
            'courses',
            'cohorts',
            'users' => function ($q) {
                $q->select('users.id', 'users.name', 'users.email', 'users.role')
                    ->withPivot('enrolled_at', 'status', 'notes');
            },
        ])
            ->withCount(['courses', 'cohorts', 'users'])
            ->latest()
            ->get();

        $coordinators = User::whereIn('role', ['admin', 'super_admin', 'academic_coordinator', 'instructor'])
            ->select('id', 'name', 'email', 'role')
            ->get();

        $allUsers = User::select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Programmes/Index', [
            'programmes' => $programmes,
            'coordinators' => $coordinators,
            'allUsers' => $allUsers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Unauthorized to establish academic programmes.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:programmes,code',
            'department' => 'required|string|max:255',
            'duration' => 'required|string|max:100',
            'delivery_mode' => 'required|in:online,in_person,hybrid',
            'coordinator_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'entry_requirements' => 'nullable|string',
            'objectives' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['title']).'-'.Str::lower($validated['code']);
        $validated['is_active'] = true;
        $validated['status'] = 'active';

        $programme = Programme::create($validated);

        AuditService::record('programme_created', 'Programme', $programme->id, $validated);

        return redirect()->back()->with('success', 'Academic programme established successfully.');
    }

    public function update(Request $request, Programme $programme): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Unauthorized to modify academic programmes.');
        }

        if ($request->input('coordinator_id') === '' || $request->input('coordinator_id') === 'null') {
            $request->merge(['coordinator_id' => null]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('programmes', 'code')->ignore($programme->id)],
            'department' => 'required|string|max:255',
            'duration' => 'required|string|max:100',
            'delivery_mode' => 'required|in:online,in_person,hybrid',
            'coordinator_id' => 'nullable|exists:users,id',
            'description' => 'nullable|string',
            'entry_requirements' => 'nullable|string',
            'objectives' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $programme->update($validated);

        AuditService::record('programme_updated', 'Programme', $programme->id, $validated);

        return redirect()->back()->with('success', 'Academic programme updated successfully.');
    }

    /**
     * Assign one or multiple users/trainees to an academic programme.
     */
    public function assignUsers(Request $request, Programme $programme): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Unauthorized to assign trainees to programmes.');
        }

        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'status' => 'nullable|string|in:active,completed,suspended,dropped',
            'notes' => 'nullable|string',
        ]);

        $status = $validated['status'] ?? 'active';
        $notes = $validated['notes'] ?? null;

        $attachData = [];
        foreach ($validated['user_ids'] as $uid) {
            $attachData[$uid] = [
                'enrolled_at' => now(),
                'status' => $status,
                'notes' => $notes,
            ];
        }

        $programme->users()->syncWithoutDetaching($attachData);

        AuditService::record('programme_users_assigned', 'Programme', $programme->id, [
            'assigned_user_ids' => $validated['user_ids'],
            'status' => $status,
        ]);

        return redirect()->back()->with('success', count($validated['user_ids']).' user(s) assigned to programme successfully.');
    }

    /**
     * Remove a user from an academic programme.
     */
    public function removeUser(Programme $programme, User $user): RedirectResponse
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin() && ! $currentUser->isAcademicCoordinator()) {
            abort(403, 'Unauthorized to remove users from programmes.');
        }

        $programme->users()->detach($user->id);

        AuditService::record('programme_user_removed', 'Programme', $programme->id, [
            'removed_user_id' => $user->id,
            'user_name' => $user->name,
        ]);

        return redirect()->back()->with('success', "{$user->name} has been removed from this programme.");
    }

    /**
     * Delete an academic programme.
     */
    public function destroy(Programme $programme): RedirectResponse
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin() && ! $currentUser->isAcademicCoordinator()) {
            abort(403, 'Unauthorized.');
        }

        $title = $programme->title;
        $programme->delete();

        AuditService::record('programme_deleted', 'Programme', $programme->id, [
            'title' => $title,
            'deleted_by' => $currentUser->id,
        ]);

        return redirect()->back()->with('success', "Programme '{$title}' deleted successfully.");
    }

    /**
     * Perform bulk operations on selected programmes.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $currentUser = Auth::user();
        if (! $currentUser->isAdmin() && ! $currentUser->isAcademicCoordinator()) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'programme_ids' => 'required|array|min:1',
            'programme_ids.*' => 'exists:programmes,id',
            'action' => 'required|string|in:delete,activate,deactivate',
        ]);

        $ids = $validated['programme_ids'];
        $count = count($ids);

        switch ($validated['action']) {
            case 'delete':
                Programme::whereIn('id', $ids)->delete();
                $msg = "Successfully deleted {$count} programme card(s).";
                break;
            case 'activate':
                Programme::whereIn('id', $ids)->update(['is_active' => true]);
                $msg = "Successfully activated {$count} programme card(s).";
                break;
            case 'deactivate':
                Programme::whereIn('id', $ids)->update(['is_active' => false]);
                $msg = "Successfully deactivated {$count} programme card(s).";
                break;
            default:
                return redirect()->back()->with('error', 'Invalid action.');
        }

        AuditService::record('programme_bulk_action', 'Programme', $currentUser->id, [
            'action' => $validated['action'],
            'target_count' => $count,
            'target_ids' => $ids,
        ]);

        return redirect()->back()->with('success', $msg);
    }
}
