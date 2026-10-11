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
    public function show(Laboratory $laboratory): Response|RedirectResponse
    {
        $user = Auth::user();

        // Find or create in-progress attempt for trainee
        $attempt = Attempt::firstOrCreate(
            [
                'user_id' => $user->id,
                'laboratory_id' => $laboratory->id,
                'status' => AttemptStatus::IN_PROGRESS,
            ],
            [
                'started_at' => now(),
            ]
        );

        $laboratory->load(['questions', 'scenario']);

        return Inertia::render('Simulation/Arena', [
            'laboratory' => $laboratory,
            'attempt' => $attempt->load(['commands', 'answers']),
        ]);
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
    public function submitAttempt(Request $request, Attempt $attempt, ScoringEngineService $scoringService): RedirectResponse
    {
        $this->authorizeAccess($attempt);

        $request->validate([
            'answers' => 'required|array',
        ]);

        $scoringService->evaluateAttempt($attempt, $request->input('answers'));

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
