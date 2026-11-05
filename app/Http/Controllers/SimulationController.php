<?php

namespace App\Http\Controllers;

use App\Enums\LabStatus;
use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\Programme;
use App\Services\Assessment\ScoringEngineService;
use App\Services\Simulation\AttemptWorkflowService;
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
     * Display the dedicated Laboratories listing arena.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $query = Laboratory::with(['course.programme', 'scenario'])
            ->where('status', LabStatus::PUBLISHED);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('scenario_background', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($programmeId = $request->input('programme_id')) {
            $query->whereHas('course', function ($q) use ($programmeId) {
                $q->where('programme_id', $programmeId);
            });
        }

        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        if ($workspace = $request->input('workspace')) {
            $query->where('primary_workspace', $workspace);
        }

        $laboratories = $query->orderBy('course_id')->orderBy('id')->get();

        // Attach user attempts/progress stats
        $userAttempts = Attempt::where('user_id', $user->id)
            ->select('id', 'laboratory_id', 'status', 'final_score', 'is_passed', 'submitted_at')
            ->get()
            ->groupBy('laboratory_id');

        $labsWithProgress = $laboratories->map(function ($lab) use ($userAttempts) {
            $attempts = $userAttempts->get($lab->id, collect());
            $bestAttempt = $attempts->where('is_passed', true)->sortByDesc('final_score')->first()
                ?? $attempts->sortByDesc('final_score')->first();
            $isCompleted = $attempts->contains('is_passed', true);
            $hasActiveAttempt = $attempts->contains(fn ($a) => in_array($a->status->value, ['in_progress', 'safety_acknowledged']));

            return [
                'id' => $lab->id,
                'title' => $lab->title,
                'slug' => $lab->slug,
                'category' => $lab->category,
                'difficulty' => $lab->difficulty,
                'estimated_minutes' => $lab->estimated_minutes,
                'passing_score' => $lab->passing_score,
                'primary_workspace' => $lab->primary_workspace,
                'scenario_background' => $lab->scenario_background,
                'learning_objectives' => $lab->learning_objectives,
                'course' => $lab->course ? [
                    'id' => $lab->course->id,
                    'title' => $lab->course->title,
                    'code' => $lab->course->code,
                    'programme' => $lab->course->programme ? [
                        'id' => $lab->course->programme->id,
                        'title' => $lab->course->programme->title,
                        'code' => $lab->course->programme->code,
                    ] : null,
                ] : null,
                'user_progress' => [
                    'is_completed' => $isCompleted,
                    'has_active_attempt' => $hasActiveAttempt,
                    'attempts_count' => $attempts->count(),
                    'best_score' => $bestAttempt?->final_score,
                    'last_attempt_id' => $bestAttempt?->id,
                ],
            ];
        });

        $programmes = Programme::where('is_active', true)
            ->select('id', 'title', 'code')
            ->withCount('courses')
            ->get();

        $workspaces = [
            ['value' => 'kali_terminal', 'label' => 'Simulated Kali Terminal'],
            ['value' => 'phishing_analyzer', 'label' => 'Phishing Email Analysis'],
            ['value' => 'log_auditor', 'label' => 'Log Forensics & Auth Inspection'],
            ['value' => 'packet_inspector', 'label' => 'PCAP Packet Metadata Inspector'],
            ['value' => 'soc_queue', 'label' => 'SIEM SOC Alert Queue & Triage'],
            ['value' => 'general_workbench', 'label' => 'General Defense Workbench'],
        ];

        $totalLabs = $labsWithProgress->count();
        $completedCount = $labsWithProgress->where('user_progress.is_completed', true)->count();

        return Inertia::render('Labs/Index', [
            'laboratories' => $labsWithProgress,
            'programmes' => $programmes,
            'workspaces' => $workspaces,
            'filters' => $request->only(['search', 'programme_id', 'difficulty', 'workspace']),
            'stats' => [
                'total_labs' => $totalLabs,
                'completed_count' => $completedCount,
                'completion_percentage' => $totalLabs > 0 ? round(($completedCount / $totalLabs) * 100) : 0,
            ],
        ]);
    }

    /**
     * Display the Simulation Lab Arena.
     */
    public function show(Laboratory $laboratory, AttemptWorkflowService $workflowService): Response|RedirectResponse
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
    public function autosave(Request $request, Attempt $attempt, AttemptWorkflowService $workflowService): JsonResponse
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
    public function acknowledgeSafety(Request $request, Attempt $attempt, AttemptWorkflowService $workflowService): JsonResponse
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
    public function reset(Attempt $attempt, AttemptWorkflowService $workflowService): RedirectResponse
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
        AttemptWorkflowService $workflowService
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
