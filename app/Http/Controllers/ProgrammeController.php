<?php

namespace App\Http\Controllers;

use App\Models\Programme;
use App\Models\User;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
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

        $programmes = Programme::with(['coordinator', 'courses', 'cohorts'])
            ->withCount(['courses', 'cohorts'])
            ->latest()
            ->get();

        $coordinators = User::whereIn('role', ['admin', 'super_admin', 'academic_coordinator', 'instructor'])
            ->select('id', 'name', 'email', 'role')
            ->get();

        return Inertia::render('Admin/Programmes/Index', [
            'programmes' => $programmes,
            'coordinators' => $coordinators,
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

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::lower($validated['code']);
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

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:programmes,code,' . $programme->id,
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
}
