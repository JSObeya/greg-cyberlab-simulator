<?php

namespace App\Http\Controllers;

use App\Enums\AttemptStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Services\Assessment\ScoringEngineService;
use App\Services\Audit\AuditService;
use App\Services\Simulation\TerminalEngineService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SimulationController extends Controller
{
    /**
     * Display the Simulation Lab Arena.
     */
    public function show(Laboratory $laboratory, \App\Services\Simulation\AttemptWorkflowService $workflowService): Response|RedirectResponse
    {
        $user = Auth::user();

        // Enforce Prerequisite Gating (Lab 1 must be passed with >= 80% before accessing subsequent labs)
        if (! $workflowService->checkPrerequisites($user, $laboratory)) {
            return redirect()->route('courses.index')->with(
                'error',
                'Prerequisite Requirement: You must complete and pass Laboratory 1 (Cybersecurity Laboratory Orientation and Rules) with at least 80% before accessing this laboratory.'
            );
        }

        $attempt = $workflowService->getOrCreateAttempt($user, $laboratory);
        $laboratory->load(['questions', 'scenario']);

        return Inertia::render('Simulation/Arena', [
            'laboratory' => $laboratory,
            'attempt' => $attempt->load(['commands', 'answers']),
        ]);
    }

    /**
     * Autosave trainee progress without final submission.
     */
    public function autosave(Request $request, Attempt $attempt, \App\Services\Simulation\AttemptWorkflowService $workflowService): JsonResponse
    {
        $this->authorizeAccess($attempt);

        $request->validate([
            'state' => 'required|array',
        ]);

        $updated = $workflowService->autosave($attempt, $request->input('state'));

        return response()->json([
            'success' => true,
            'saved_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Digitally acknowledge safety rules of engagement.
     */
    public function acknowledgeSafety(Request $request, Attempt $attempt, \App\Services\Simulation\AttemptWorkflowService $workflowService): JsonResponse
    {
        $this->authorizeAccess($attempt);

        $version = $request->input('version', '1.0.0');
        $updated = $workflowService->acknowledgeSafety($attempt, $version);

        return response()->json([
            'success' => true,
            'acknowledged_at' => $updated->safety_acknowledged_at->toIso8601String(),
        ]);
    }

    /**
     * Reset attempt state safely.
     */
    public function reset(Attempt $attempt, \App\Services\Simulation\AttemptWorkflowService $workflowService): RedirectResponse
    {
        $this->authorizeAccess($attempt);

        $workflowService->resetAttempt($attempt);

        return redirect()->route('simulation.show', $attempt->laboratory->slug)->with(
            'success',
            'Virtual scenario environment has been safely reset to starting state.'
        );
    }

    /**
     * Process a simulated terminal command safely.
     */
    public function executeCommand(Request $request, Attempt $attempt, TerminalEngineService $terminalService): JsonResponse
    {
        $this->authorizeAccess($attempt);

        $request->validate([
            'command' => 'required|string|max:255',
        ]);

        $result = $terminalService->evaluateCommand($attempt, $request->input('command'));

        return response()->json($result);
    }

    /**
     * Submit lab attempt answers for automatic scoring.
     */
    public function submitAttempt(
        Request $request,
        Attempt $attempt,
        ScoringEngineService $scoringService,
        \App\Services\Simulation\AttemptWorkflowService $workflowService
    ): RedirectResponse {
        $this->authorizeAccess($attempt);

        // Check if submission is rubric-based (e.g. Lab 1) or question-based
        if ($request->has('rubric_submission')) {
            $workflowService->submitAttempt($attempt, $request->all());
        } else {
            $request->validate([
                'answers' => 'required|array',
            ]);
            $scoringService->evaluateAttempt($attempt, $request->input('answers'));
        }

        return redirect()->route('simulation.result', $attempt);
    }

    /**
     * Display attempt debriefing and remediation.
     */
    public function result(Attempt $attempt): Response
    {
        $this->authorizeAccess($attempt);

        return Inertia::render('Simulation/Result', [
            'attempt' => $attempt->load(['laboratory.questions', 'answers']),
        ]);
    }

    protected function authorizeAccess(Attempt $attempt): void
    {
        $user = Auth::user();
        if ($attempt->user_id !== $user->id && ! $user->isAdmin() && ! $user->isInstructor()) {
            abort(403, 'Unauthorized access to this simulation attempt.');
        }
    }
}
