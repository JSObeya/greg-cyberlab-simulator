<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\Programme;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExamController extends Controller
{
    /**
     * Display a listing of MCQ examinations.
     */
    public function index(Request $request): \Inertia\Response
    {
        /** @var User $user */
        $user = Auth::user();
        $isStaff = $user->isAdmin() || $user->isInstructor() || $user->isAcademicCoordinator();

        $query = Quiz::with(['cohort:id,name,code', 'programme:id,title,code', 'course:id,title,code'])
            ->withCount('questions')
            ->withCount('attempts');

        // Non-staff trainees only see published exams
        if (! $isStaff) {
            $query->where('is_published', true);

            // Filter to exams targeted to trainee's cohort/programme or global
            $userCohortIds = $user->cohorts()->pluck('cohorts.id')->toArray();
            $userProgrammeIds = $user->programmes()->pluck('programmes.id')->toArray();

            $query->where(function ($q) use ($userCohortIds, $userProgrammeIds) {
                $q->whereNull('cohort_id')->whereNull('programme_id')
                    ->orWhereIn('cohort_id', $userCohortIds)
                    ->orWhereIn('programme_id', $userProgrammeIds);
            });
        }

        // Optional filter
        if ($request->filled('cohort_id')) {
            $query->where('cohort_id', $request->input('cohort_id'));
        }
        if ($request->filled('programme_id')) {
            $query->where('programme_id', $request->input('programme_id'));
        }
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $exams = $query->latest()->get()->map(function (Quiz $quiz) use ($user) {
            $userAttempts = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->get();

            $bestAttempt = $userAttempts->where('status', 'graded')->sortByDesc('score_percentage')->first();
            $inProgressAttempt = $userAttempts->where('status', 'in_progress')->first();
            $attemptsUsed = $userAttempts->where('status', 'graded')->count();

            return [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'slug' => $quiz->slug,
                'description' => $quiz->description ?? $quiz->instructions,
                'category' => $quiz->category ?? 'cybersecurity',
                'time_limit_minutes' => $quiz->time_limit_minutes,
                'passing_score_percentage' => $quiz->passing_score_percentage,
                'max_attempts' => $quiz->max_attempts,
                'is_published' => (bool) $quiz->is_published,
                'randomize_questions' => (bool) $quiz->randomize_questions,
                'randomize_options' => (bool) $quiz->randomize_options,
                'show_correct_answers_after' => (bool) $quiz->show_correct_answers_after,
                'questions_count' => $quiz->questions_count,
                'attempts_count' => $quiz->attempts_count,
                'cohort' => $quiz->cohort,
                'programme' => $quiz->programme,
                'course' => $quiz->course,
                'created_at' => $quiz->created_at->format('M d, Y'),
                // Trainee-specific progress
                'user_progress' => [
                    'attempts_used' => $attemptsUsed,
                    'can_attempt' => $quiz->max_attempts === 0 || $attemptsUsed < $quiz->max_attempts,
                    'in_progress_attempt_id' => $inProgressAttempt?->id,
                    'has_passed' => $bestAttempt?->is_passed ?? false,
                    'best_score' => $bestAttempt?->score_percentage,
                    'latest_attempt_id' => $userAttempts->first()?->id,
                ],
            ];
        });

        $cohorts = Cohort::select('id', 'name', 'code')->orderBy('name')->get();
        $programmes = Programme::select('id', 'title', 'code')->orderBy('title')->get();
        $courses = Course::select('id', 'title', 'code')->orderBy('title')->get();

        // High-level statistics
        $stats = [
            'total_exams' => Quiz::count(),
            'published_exams' => Quiz::where('is_published', true)->count(),
            'total_questions' => QuizQuestion::count(),
            'total_attempts' => QuizAttempt::count(),
            'average_pass_rate' => QuizAttempt::where('status', 'graded')->count() > 0
                ? round((QuizAttempt::where('status', 'graded')->where('is_passed', true)->count() / QuizAttempt::where('status', 'graded')->count()) * 100, 1)
                : 0,
        ];

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
            'cohorts' => $cohorts,
            'programmes' => $programmes,
            'courses' => $courses,
            'stats' => $stats,
            'isStaff' => $isStaff,
            'filters' => $request->only(['cohort_id', 'programme_id', 'category']),
        ]);
    }

    /**
     * Store a newly created MCQ Exam.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->authorizeStaff();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'instructions' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'cohort_id' => 'nullable|exists:cohorts,id',
            'programme_id' => 'nullable|exists:programmes,id',
            'course_id' => 'nullable|exists:courses,id',
            'time_limit_minutes' => 'required|integer|min:0|max:300',
            'passing_score_percentage' => 'required|integer|min:1|max:100',
            'max_attempts' => 'required|integer|min:0|max:10',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'show_correct_answers_after' => 'boolean',
            'is_published' => 'boolean',
        ]);

        $slugBase = Str::slug($validated['title']);
        $slug = $slugBase;
        $counter = 1;
        while (Quiz::where('slug', $slug)->exists()) {
            $slug = "{$slugBase}-{$counter}";
            $counter++;
        }

        $validated['slug'] = $slug;
        $validated['exam_type'] = 'mcq';
        $quiz = Quiz::create($validated);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'exam_created',
            'entity_type' => Quiz::class,
            'entity_id' => $quiz->id,
            'payload' => ['title' => $quiz->title, 'slug' => $quiz->slug],
        ]);

        return redirect()->route('exams.index')->with('success', "MCQ Examination '{$quiz->title}' created successfully.");
    }

    /**
     * Update the specified MCQ Exam.
     */
    public function update(Request $request, Quiz $quiz): RedirectResponse
    {
        $this->authorizeStaff();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'instructions' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'cohort_id' => 'nullable|exists:cohorts,id',
            'programme_id' => 'nullable|exists:programmes,id',
            'course_id' => 'nullable|exists:courses,id',
            'time_limit_minutes' => 'required|integer|min:0|max:300',
            'passing_score_percentage' => 'required|integer|min:1|max:100',
            'max_attempts' => 'required|integer|min:0|max:10',
            'randomize_questions' => 'boolean',
            'randomize_options' => 'boolean',
            'show_correct_answers_after' => 'boolean',
            'is_published' => 'boolean',
        ]);

        $quiz->update($validated);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'exam_updated',
            'entity_type' => Quiz::class,
            'entity_id' => $quiz->id,
            'payload' => ['title' => $quiz->title],
        ]);

        return redirect()->route('exams.index')->with('success', "Examination '{$quiz->title}' updated successfully.");
    }

    /**
     * Remove the specified MCQ Exam.
     */
    public function destroy(Quiz $quiz): RedirectResponse
    {
        $this->authorizeStaff();

        $title = $quiz->title;
        $quiz->delete();

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'exam_deleted',
            'entity_type' => Quiz::class,
            'entity_id' => $quiz->id,
            'payload' => ['title' => $title],
        ]);

        return redirect()->route('exams.index')->with('success', "Examination '{$title}' deleted successfully.");
    }

    /**
     * Get questions for an exam (for question manager modal/view).
     */
    public function questions(Quiz $quiz): JsonResponse
    {
        $this->authorizeStaff();

        $questions = $quiz->questions()->orderBy('order')->get();

        return response()->json([
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'questions_count' => $questions->count(),
            ],
            'questions' => $questions,
        ]);
    }

    /**
     * Store a new question under an exam.
     */
    public function storeQuestion(Request $request, Quiz $quiz): JsonResponse
    {
        $this->authorizeStaff();

        $validated = $request->validate([
            'prompt' => 'required|string',
            'points' => 'required|integer|min:1|max:100',
            'explanation' => 'nullable|string',
            'options' => 'required|array|min:2|max:6',
            'options.*.id' => 'required|string',
            'options.*.text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        // Ensure at least one option is marked correct
        $hasCorrect = collect($validated['options'])->contains('is_correct', true);
        if (! $hasCorrect) {
            return response()->json(['message' => 'At least one option must be marked as correct.'], 422);
        }

        $order = ($quiz->questions()->max('order') ?? 0) + 1;

        $question = $quiz->questions()->create([
            'prompt' => $validated['prompt'],
            'points' => $validated['points'],
            'explanation' => $validated['explanation'] ?? null,
            'options' => $validated['options'],
            'order' => $order,
            'type' => 'multiple_choice',
        ]);

        return response()->json([
            'message' => 'Question added successfully.',
            'question' => $question,
        ]);
    }

    /**
     * Update an existing question.
     */
    public function updateQuestion(Request $request, Quiz $quiz, QuizQuestion $question): JsonResponse
    {
        $this->authorizeStaff();

        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $validated = $request->validate([
            'prompt' => 'required|string',
            'points' => 'required|integer|min:1|max:100',
            'explanation' => 'nullable|string',
            'options' => 'required|array|min:2|max:6',
            'options.*.id' => 'required|string',
            'options.*.text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $hasCorrect = collect($validated['options'])->contains('is_correct', true);
        if (! $hasCorrect) {
            return response()->json(['message' => 'At least one option must be marked as correct.'], 422);
        }

        $question->update([
            'prompt' => $validated['prompt'],
            'points' => $validated['points'],
            'explanation' => $validated['explanation'] ?? null,
            'options' => $validated['options'],
        ]);

        return response()->json([
            'message' => 'Question updated successfully.',
            'question' => $question,
        ]);
    }

    /**
     * Delete a question.
     */
    public function destroyQuestion(Quiz $quiz, QuizQuestion $question): JsonResponse
    {
        $this->authorizeStaff();

        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $question->delete();

        return response()->json(['message' => 'Question deleted successfully.']);
    }

    /**
     * Bulk CSV Import into an existing exam.
     */
    public function importCsv(Request $request, Quiz $quiz): RedirectResponse
    {
        $this->authorizeStaff();

        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('csv_file');
        $importResult = $this->parseAndInsertQuestions($quiz, $file->getRealPath());

        if ($importResult['imported'] === 0) {
            return redirect()->back()->withErrors([
                'csv_file' => 'No valid questions could be imported. Please review the CSV template format. Errors: '.implode('; ', array_slice($importResult['errors'], 0, 3)),
            ]);
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'exam_questions_imported_csv',
            'entity_type' => Quiz::class,
            'entity_id' => $quiz->id,
            'payload' => [
                'imported_count' => $importResult['imported'],
                'file_name' => $file->getClientOriginalName(),
            ],
        ]);

        return redirect()->route('exams.index')->with('success', "Successfully imported {$importResult['imported']} questions into '{$quiz->title}'.");
    }

    /**
     * Create a brand-new Exam and import questions in one step.
     */
    public function createFromCsv(Request $request): RedirectResponse
    {
        $this->authorizeStaff();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:50',
            'cohort_id' => 'nullable|exists:cohorts,id',
            'programme_id' => 'nullable|exists:programmes,id',
            'time_limit_minutes' => 'required|integer|min:0|max:300',
            'passing_score_percentage' => 'required|integer|min:1|max:100',
            'max_attempts' => 'required|integer|min:0|max:10',
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
            'is_published' => 'boolean',
        ]);

        $slugBase = Str::slug($validated['title']);
        $slug = $slugBase;
        $counter = 1;
        while (Quiz::where('slug', $slug)->exists()) {
            $slug = "{$slugBase}-{$counter}";
            $counter++;
        }

        $quiz = Quiz::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? 'cybersecurity',
            'exam_type' => 'mcq',
            'cohort_id' => $validated['cohort_id'] ?? null,
            'programme_id' => $validated['programme_id'] ?? null,
            'time_limit_minutes' => $validated['time_limit_minutes'],
            'passing_score_percentage' => $validated['passing_score_percentage'],
            'max_attempts' => $validated['max_attempts'],
            'randomize_questions' => true,
            'randomize_options' => true,
            'show_correct_answers_after' => true,
            'is_published' => $validated['is_published'] ?? true,
        ]);

        $importResult = $this->parseAndInsertQuestions($quiz, $request->file('csv_file')->getRealPath());

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => 'exam_created_from_csv',
            'entity_type' => Quiz::class,
            'entity_id' => $quiz->id,
            'payload' => [
                'title' => $quiz->title,
                'imported_questions' => $importResult['imported'],
            ],
        ]);

        return redirect()->route('exams.index')->with('success', "Exam '{$quiz->title}' created with {$importResult['imported']} questions imported from CSV.");
    }

    /**
     * Download the standard CSV Template for MCQ bulk import.
     */
    public function downloadCsvTemplate(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="mcq_exam_template.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            // Write UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // Header
            fputcsv($handle, ['prompt', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'points', 'explanation']);

            // Sample Questions
            $samples = [
                [
                    'Which core pillar of the CIA Triad is compromised when unauthorized ransomware encrypts sensitive mission flight logs?',
                    'Confidentiality',
                    'Integrity',
                    'Availability',
                    'Non-repudiation',
                    'C',
                    '5',
                    'Ransomware encrypts assets preventing authorized users from accessing operational systems, violating Availability.',
                ],
                [
                    'What military classification level is designated for information whose unauthorized disclosure could cause serious damage to national security?',
                    'Restricted',
                    'Confidential',
                    'Secret',
                    'Top Secret',
                    'C',
                    '5',
                    'According to military security standards, Secret information disclosure causes serious damage, whereas Top Secret causes exceptionally grave damage.',
                ],
                [
                    'Which authentication factor category does a hardware CAC (Common Access Card) or Smart Card belong to?',
                    'Something you know',
                    'Something you have',
                    'Something you are',
                    'Somewhere you are',
                    'B',
                    '5',
                    'A physical smart card or token represents possession: Something you have.',
                ],
                [
                    'In role-based access control (RBAC), what principle dictates that a Naval Watch Officer receives only the minimal permissions necessary for duty?',
                    'Principle of Least Privilege (PoLP)',
                    'Separation of Duties',
                    'Implicit Allow',
                    'Dual Custody',
                    'A',
                    '5',
                    'The Principle of Least Privilege ensures users only hold access strictly essential for their assigned duties.',
                ],
                [
                    'What cryptographic defense mechanism prevents rainbow table attacks against stored naval user passwords?',
                    'Rot13 Obfuscation',
                    'Cryptographic Salting',
                    'Base64 Encoding',
                    'CRC32 Checksums',
                    'B',
                    '5',
                    'A random cryptographic salt ensures identical passwords yield different hashes, neutralizing precomputed rainbow tables.',
                ],
            ];

            foreach ($samples as $sample) {
                fputcsv($handle, $sample);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Trainee Live Examination Taking View.
     */
    public function take(Quiz $quiz): \Inertia\Response|RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $quiz->is_published && ! ($user->isAdmin() || $user->isInstructor())) {
            return redirect()->route('exams.index')->with('error', 'This examination is currently unpublished.');
        }

        // Check if an attempt is already in progress
        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        // Check if previous attempts exceeded limit
        if (! $attempt) {
            $gradedCount = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->where('status', 'graded')
                ->count();

            if ($quiz->max_attempts > 0 && $gradedCount >= $quiz->max_attempts) {
                return redirect()->route('exams.index')->with('error', 'You have exhausted all allowed attempts for this examination.');
            }
        }

        // Calculate seconds remaining if attempt active
        $secondsRemaining = null;
        if ($attempt && $attempt->expires_at) {
            $secondsRemaining = max(0, (int) now()->diffInSeconds($attempt->expires_at, false));
            if ($secondsRemaining <= 0) {
                $this->finalizeAttempt($attempt);

                return redirect()->route('exams.result', ['quiz' => $quiz->id, 'attempt' => $attempt->id])
                    ->with('error', 'Time has expired for this examination attempt.');
            }
        }

        // Load questions sanitized of correct answers
        $questions = $quiz->questions()->orderBy('order')->get()->map(function (QuizQuestion $q) use ($quiz) {
            $options = collect($q->options ?? [])->map(function ($opt) {
                return [
                    'id' => (string) ($opt['id'] ?? ''),
                    'text' => (string) ($opt['text'] ?? ''),
                ];
            });

            if ($quiz->randomize_options) {
                $options = $options->shuffle();
            }

            return [
                'id' => $q->id,
                'prompt' => $q->prompt,
                'points' => $q->points,
                'type' => $q->type,
                'options' => $options->values()->all(),
            ];
        });

        if ($quiz->randomize_questions) {
            $questions = $questions->shuffle()->values();
        }

        return Inertia::render('Exams/Take', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description ?? $quiz->instructions,
                'instructions' => $quiz->instructions,
                'category' => $quiz->category,
                'time_limit_minutes' => $quiz->time_limit_minutes,
                'passing_score_percentage' => $quiz->passing_score_percentage,
                'total_questions' => $questions->count(),
                'total_points' => $quiz->questions()->sum('points'),
            ],
            'attempt' => $attempt ? [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'started_at' => $attempt->started_at->toISOString(),
                'expires_at' => $attempt->expires_at?->toISOString(),
                'seconds_remaining' => $secondsRemaining,
                'answers_state' => $attempt->answers_state ?? (object) [],
            ] : null,
            'questions' => $questions,
        ]);
    }

    /**
     * Start or initialize an exam attempt.
     */
    public function startAttempt(Quiz $quiz): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Check if an attempt is already in progress
        $attempt = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if (! $attempt) {
            $gradedCount = QuizAttempt::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->where('status', 'graded')
                ->count();

            if ($quiz->max_attempts > 0 && $gradedCount >= $quiz->max_attempts) {
                return response()->json(['message' => 'Maximum allowed attempts reached.'], 422);
            }

            $attempt = QuizAttempt::create([
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'attempt_number' => $gradedCount + 1,
                'status' => 'in_progress',
                'started_at' => now(),
                'expires_at' => $quiz->time_limit_minutes > 0 ? now()->addMinutes($quiz->time_limit_minutes) : null,
                'answers_state' => (object) [],
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'exam_attempt_started',
                'entity_type' => QuizAttempt::class,
                'entity_id' => $attempt->id,
                'payload' => ['quiz_id' => $quiz->id, 'attempt_number' => $attempt->attempt_number],
            ]);
        }

        $secondsRemaining = $attempt->expires_at ? max(0, (int) now()->diffInSeconds($attempt->expires_at, false)) : null;

        return response()->json([
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'started_at' => $attempt->started_at->toISOString(),
                'expires_at' => $attempt->expires_at?->toISOString(),
                'seconds_remaining' => $secondsRemaining,
                'answers_state' => $attempt->answers_state ?? (object) [],
            ],
        ]);
    }

    /**
     * Autosave candidate answers state in real-time.
     */
    public function autosave(Request $request, QuizAttempt $attempt): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        if ($attempt->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json(['message' => 'This attempt has already been submitted.'], 422);
        }

        // Check if expired
        if ($attempt->expires_at && now()->isAfter($attempt->expires_at)) {
            $this->finalizeAttempt($attempt);

            return response()->json(['message' => 'Time expired.', 'expired' => true], 422);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $attempt->update([
            'answers_state' => $validated['answers'],
        ]);

        return response()->json(['message' => 'Answers synced successfully.']);
    }

    /**
     * Submit and auto-grade the candidate's exam attempt.
     */
    public function submitAttempt(Request $request, QuizAttempt $attempt): JsonResponse|RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();
        if ($attempt->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403);
        }

        if ($attempt->status === 'graded') {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Attempt already graded.',
                    'redirect_url' => route('exams.result', ['quiz' => $attempt->quiz_id, 'attempt' => $attempt->id]),
                ]);
            }

            return redirect()->route('exams.result', ['quiz' => $attempt->quiz_id, 'attempt' => $attempt->id]);
        }

        if ($request->has('answers') && is_array($request->input('answers'))) {
            $attempt->update(['answers_state' => $request->input('answers')]);
        }

        $result = $this->finalizeAttempt($attempt);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Exam completed successfully.',
                'result' => $result,
                'redirect_url' => route('exams.result', ['quiz' => $attempt->quiz_id, 'attempt' => $attempt->id]),
            ]);
        }

        return redirect()->route('exams.result', ['quiz' => $attempt->quiz_id, 'attempt' => $attempt->id])
            ->with('success', 'Examination submitted and auto-graded successfully.');
    }

    /**
     * Trainee Result & Comprehensive Review page.
     */
    public function result(Quiz $quiz, QuizAttempt $attempt): \Inertia\Response
    {
        /** @var User $user */
        $user = Auth::user();
        $isStaff = $user->isAdmin() || $user->isInstructor() || $user->isAcademicCoordinator();

        if ($attempt->user_id !== $user->id && ! $isStaff) {
            abort(403, 'Unauthorized access to this examination result.');
        }

        $quiz->load(['cohort:id,name,code', 'programme:id,title,code']);
        $candidate = $attempt->user()->select('id', 'name', 'email', 'phone')->first();

        $canReviewAnswers = $quiz->show_correct_answers_after || $isStaff;
        $userAnswers = $attempt->answers_state ?? [];

        $questionsReview = [];
        if ($canReviewAnswers) {
            $questionsReview = $quiz->questions()->orderBy('order')->get()->map(function (QuizQuestion $q) use ($userAnswers) {
                $userSelected = $userAnswers[$q->id] ?? null;
                $options = collect($q->options ?? []);
                $correctOpt = $options->firstWhere('is_correct', true);
                $correctOptId = $correctOpt['id'] ?? null;
                $isCorrect = ($userSelected !== null && $correctOptId !== null && (string) $userSelected === (string) $correctOptId);

                return [
                    'id' => $q->id,
                    'prompt' => $q->prompt,
                    'points' => $q->points,
                    'explanation' => $q->explanation,
                    'user_selected_option' => $userSelected,
                    'correct_option_id' => $correctOptId,
                    'is_correct' => $isCorrect,
                    'options' => $options->map(function ($opt) {
                        return [
                            'id' => (string) ($opt['id'] ?? ''),
                            'text' => (string) ($opt['text'] ?? ''),
                            'is_correct' => (bool) ($opt['is_correct'] ?? false),
                        ];
                    })->all(),
                ];
            });
        }

        $timeSpentSeconds = $attempt->submitted_at && $attempt->started_at
            ? max(0, $attempt->started_at->diffInSeconds($attempt->submitted_at))
            : null;

        $gradedAttemptsCount = QuizAttempt::where('quiz_id', $quiz->id)
            ->where('user_id', $attempt->user_id)
            ->where('status', 'graded')
            ->count();

        return Inertia::render('Exams/Result', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'category' => $quiz->category,
                'time_limit_minutes' => $quiz->time_limit_minutes,
                'passing_score_percentage' => $quiz->passing_score_percentage,
                'max_attempts' => $quiz->max_attempts,
                'cohort' => $quiz->cohort,
                'programme' => $quiz->programme,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'status' => $attempt->status,
                'total_score' => $attempt->total_score,
                'score_percentage' => $attempt->score_percentage,
                'is_passed' => $attempt->is_passed,
                'started_at' => $attempt->started_at->format('M d, Y H:i:s'),
                'submitted_at' => $attempt->submitted_at?->format('M d, Y H:i:s'),
                'time_spent_display' => $timeSpentSeconds ? sprintf('%02d min %02d sec', floor($timeSpentSeconds / 60), $timeSpentSeconds % 60) : 'N/A',
            ],
            'candidate' => $candidate,
            'can_retake' => ($quiz->max_attempts === 0 || $gradedAttemptsCount < $quiz->max_attempts),
            'can_review_answers' => $canReviewAnswers,
            'questions_review' => $questionsReview,
            'isStaff' => $isStaff,
        ]);
    }

    /**
     * Comprehensive Examination & Trainee Result Analytics Dashboard.
     */
    public function analytics(Request $request): \Inertia\Response
    {
        $this->authorizeStaff();

        $selectedQuizId = $request->input('quiz_id');
        $selectedCohortId = $request->input('cohort_id');
        $selectedProgrammeId = $request->input('programme_id');

        $attemptsQuery = QuizAttempt::with(['quiz.cohort', 'quiz.programme', 'user'])
            ->where('status', 'graded');

        if ($selectedQuizId) {
            $attemptsQuery->where('quiz_id', $selectedQuizId);
        }
        if ($selectedCohortId) {
            $attemptsQuery->whereHas('quiz', fn ($q) => $q->where('cohort_id', $selectedCohortId));
        }
        if ($selectedProgrammeId) {
            $attemptsQuery->whereHas('quiz', fn ($q) => $q->where('programme_id', $selectedProgrammeId));
        }

        $attempts = $attemptsQuery->latest('submitted_at')->get();

        $totalAttempts = $attempts->count();
        $uniqueCandidates = $attempts->pluck('user_id')->unique()->count();
        $passedAttempts = $attempts->where('is_passed', true)->count();
        $passRate = $totalAttempts > 0 ? round(($passedAttempts / $totalAttempts) * 100, 1) : 0;
        $averageScore = $totalAttempts > 0 ? round($attempts->avg('score_percentage'), 1) : 0;

        // Score Distribution Brackets
        $distribution = [
            'below_50' => $attempts->where('score_percentage', '<', 50)->count(),
            'range_50_69' => $attempts->whereBetween('score_percentage', [50, 69])->count(),
            'range_70_84' => $attempts->whereBetween('score_percentage', [70, 84])->count(),
            'range_85_100' => $attempts->where('score_percentage', '>=', 85)->count(),
        ];

        // Question Difficulty Analytics (error rate per question)
        $questionStats = [];
        $relevantQuizzes = $selectedQuizId
            ? Quiz::where('id', $selectedQuizId)->get()
            : Quiz::has('attempts')->get();

        foreach ($relevantQuizzes as $qItem) {
            $qAttempts = $attempts->where('quiz_id', $qItem->id);
            if ($qAttempts->isEmpty()) {
                continue;
            }

            foreach ($qItem->questions as $question) {
                $totalResponses = 0;
                $correctResponses = 0;

                $correctOpt = collect($question->options)->firstWhere('is_correct', true);
                $correctOptId = $correctOpt['id'] ?? null;

                foreach ($qAttempts as $att) {
                    $ans = $att->answers_state[$question->id] ?? null;
                    if ($ans !== null) {
                        $totalResponses++;
                        if ($correctOptId !== null && (string) $ans === (string) $correctOptId) {
                            $correctResponses++;
                        }
                    }
                }

                if ($totalResponses > 0) {
                    $accuracy = round(($correctResponses / $totalResponses) * 100, 1);
                    $questionStats[] = [
                        'question_id' => $question->id,
                        'quiz_title' => $qItem->title,
                        'prompt' => Str::limit($question->prompt, 90),
                        'total_responses' => $totalResponses,
                        'correct_responses' => $correctResponses,
                        'accuracy_rate' => $accuracy,
                        'error_rate' => round(100 - $accuracy, 1),
                    ];
                }
            }
        }

        // Sort questions by highest error rate (hardest questions first)
        usort($questionStats, fn ($a, $b) => $b['error_rate'] <=> $a['error_rate']);
        $hardestQuestions = array_slice($questionStats, 0, 8);

        // Trainee Performance Leaderboard / Registry
        $recentResults = $attempts->take(50)->map(function (QuizAttempt $att) {
            return [
                'id' => $att->id,
                'quiz_id' => $att->quiz_id,
                'quiz_title' => $att->quiz?->title ?? 'N/A',
                'candidate_name' => $att->user?->name ?? 'Unknown Candidate',
                'candidate_email' => $att->user?->email ?? '',
                'cohort_name' => $att->quiz?->cohort?->name ?? 'General',
                'attempt_number' => $att->attempt_number,
                'score_percentage' => $att->score_percentage,
                'total_score' => $att->total_score,
                'is_passed' => $att->is_passed,
                'submitted_at' => $att->submitted_at?->format('M d, Y H:i'),
            ];
        });

        // Cohort Performance Breakdown
        $cohortBreakdown = Cohort::withCount('users')->get()->map(function (Cohort $c) {
            $cohortAttempts = QuizAttempt::whereHas('quiz', fn ($q) => $q->where('cohort_id', $c->id))
                ->where('status', 'graded')
                ->get();

            $cnt = $cohortAttempts->count();

            return [
                'cohort_id' => $c->id,
                'name' => $c->name,
                'code' => $c->code,
                'enrolled_count' => $c->users_count,
                'attempts_count' => $cnt,
                'pass_rate' => $cnt > 0 ? round(($cohortAttempts->where('is_passed', true)->count() / $cnt) * 100, 1) : 0,
                'average_score' => $cnt > 0 ? round($cohortAttempts->avg('score_percentage'), 1) : 0,
            ];
        });

        return Inertia::render('Exams/Analytics', [
            'metrics' => [
                'total_attempts' => $totalAttempts,
                'unique_candidates' => $uniqueCandidates,
                'passed_attempts' => $passedAttempts,
                'pass_rate' => $passRate,
                'average_score' => $averageScore,
            ],
            'distribution' => $distribution,
            'hardest_questions' => $hardestQuestions,
            'recent_results' => $recentResults,
            'cohort_breakdown' => $cohortBreakdown,
            'quizzes' => Quiz::select('id', 'title')->orderBy('title')->get(),
            'cohorts' => Cohort::select('id', 'name', 'code')->orderBy('name')->get(),
            'programmes' => Programme::select('id', 'title', 'code')->orderBy('title')->get(),
            'filters' => [
                'quiz_id' => $selectedQuizId ? (int) $selectedQuizId : null,
                'cohort_id' => $selectedCohortId ? (int) $selectedCohortId : null,
                'programme_id' => $selectedProgrammeId ? (int) $selectedProgrammeId : null,
            ],
        ]);
    }

    /**
     * Bulk Result Export to CSV.
     */
    public function exportResults(Request $request): StreamedResponse
    {
        $this->authorizeStaff();

        $selectedQuizId = $request->input('quiz_id');
        $selectedCohortId = $request->input('cohort_id');
        $selectedProgrammeId = $request->input('programme_id');

        $query = QuizAttempt::with(['quiz.cohort', 'quiz.programme', 'user'])
            ->where('status', 'graded');

        if ($selectedQuizId) {
            $query->where('quiz_id', $selectedQuizId);
        }
        if ($selectedCohortId) {
            $query->whereHas('quiz', fn ($q) => $q->where('cohort_id', $selectedCohortId));
        }
        if ($selectedProgrammeId) {
            $query->whereHas('quiz', fn ($q) => $q->where('programme_id', $selectedProgrammeId));
        }

        $attempts = $query->latest('submitted_at')->get();

        $filename = 'exam_results_export_'.now()->format('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($attempts) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($handle, [
                'Attempt ID',
                'Candidate Name',
                'Operational Email',
                'Phone',
                'Exam Title',
                'Category',
                'Cohort Code',
                'Cohort Name',
                'Programme',
                'Attempt Number',
                'Score Percentage (%)',
                'Points Awarded',
                'Result Status',
                'Started At',
                'Submitted At',
                'Time Spent (min)',
            ]);

            foreach ($attempts as $att) {
                $timeSpentMin = $att->started_at && $att->submitted_at
                    ? round($att->started_at->diffInSeconds($att->submitted_at) / 60, 1)
                    : 0;

                fputcsv($handle, [
                    $att->id,
                    $att->user?->name ?? 'N/A',
                    $att->user?->email ?? 'N/A',
                    $att->user?->phone ?? 'N/A',
                    $att->quiz?->title ?? 'N/A',
                    $att->quiz?->category ?? 'General',
                    $att->quiz?->cohort?->code ?? 'N/A',
                    $att->quiz?->cohort?->name ?? 'General',
                    $att->quiz?->programme?->title ?? 'N/A',
                    $att->attempt_number,
                    $att->score_percentage,
                    $att->total_score,
                    $att->is_passed ? 'PASS' : 'FAIL',
                    $att->started_at?->toDateTimeString(),
                    $att->submitted_at?->toDateTimeString(),
                    $timeSpentMin,
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Grade attempt and calculate final score.
     */
    protected function finalizeAttempt(QuizAttempt $attempt): array
    {
        $quiz = $attempt->quiz;
        $questions = $quiz->questions;
        $answers = $attempt->answers_state ?? [];

        $totalPointsPossible = 0;
        $awardedPoints = 0;

        foreach ($questions as $question) {
            $totalPointsPossible += $question->points;
            $userAnswer = $answers[$question->id] ?? null;

            if ($userAnswer !== null) {
                $correctOpt = collect($question->options)->firstWhere('is_correct', true);
                if ($correctOpt && isset($correctOpt['id']) && (string) $correctOpt['id'] === (string) $userAnswer) {
                    $awardedPoints += $question->points;
                }
            }
        }

        $percentage = $totalPointsPossible > 0 ? (int) round(($awardedPoints / $totalPointsPossible) * 100) : 0;
        $isPassed = $percentage >= $quiz->passing_score_percentage;

        $attempt->update([
            'status' => 'graded',
            'submitted_at' => now(),
            'total_score' => $awardedPoints,
            'score_percentage' => $percentage,
            'is_passed' => $isPassed,
        ]);

        AuditLog::create([
            'user_id' => $attempt->user_id,
            'action' => 'exam_attempt_submitted',
            'entity_type' => QuizAttempt::class,
            'entity_id' => $attempt->id,
            'payload' => [
                'quiz_id' => $quiz->id,
                'score' => $awardedPoints,
                'percentage' => $percentage,
                'is_passed' => $isPassed,
            ],
        ]);

        return [
            'total_score' => $awardedPoints,
            'total_points_possible' => $totalPointsPossible,
            'score_percentage' => $percentage,
            'is_passed' => $isPassed,
        ];
    }

    /**
     * Parse CSV file and insert questions into an exam.
     */
    protected function parseAndInsertQuestions(Quiz $quiz, string $filePath): array
    {
        $imported = 0;
        $errors = [];

        if (! file_exists($filePath) || ! is_readable($filePath)) {
            return ['imported' => 0, 'errors' => ['File could not be read.']];
        }

        $handle = fopen($filePath, 'r');
        if (! $handle) {
            return ['imported' => 0, 'errors' => ['Could not open CSV file.']];
        }

        // Read header
        $rawHeader = fgetcsv($handle);
        if (! $rawHeader) {
            fclose($handle);

            return ['imported' => 0, 'errors' => ['Empty CSV file.']];
        }

        // Strip UTF-8 BOM if present on first column
        $rawHeader[0] = preg_replace('/^\xEF\xBB\xBF/', '', $rawHeader[0]);
        $header = array_map(fn ($h) => strtolower(trim($h)), $rawHeader);

        // Find column indexes flexibly
        $colPrompt = $this->findColIndex($header, ['prompt', 'question', 'question_text', 'question_prompt']);
        $colOptA = $this->findColIndex($header, ['option_a', 'choice_a', 'option1', 'a']);
        $colOptB = $this->findColIndex($header, ['option_b', 'choice_b', 'option2', 'b']);
        $colOptC = $this->findColIndex($header, ['option_c', 'choice_c', 'option3', 'c']);
        $colOptD = $this->findColIndex($header, ['option_d', 'choice_d', 'option4', 'd']);
        $colCorrect = $this->findColIndex($header, ['correct_option', 'correct_answer', 'answer', 'correct']);
        $colPoints = $this->findColIndex($header, ['points', 'score', 'marks']);
        $colExplanation = $this->findColIndex($header, ['explanation', 'rationale', 'reason']);

        if ($colPrompt === null || $colOptA === null || $colOptB === null || $colCorrect === null) {
            fclose($handle);

            return [
                'imported' => 0,
                'errors' => ['Missing required columns: prompt/question, option_a, option_b, correct_option.'],
            ];
        }

        $order = ($quiz->questions()->max('order') ?? 0) + 1;
        $rowIndex = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $rowIndex++;
            if (empty(array_filter($row))) {
                continue; // Skip blank rows
            }

            $prompt = trim($row[$colPrompt] ?? '');
            $optA = trim($row[$colOptA] ?? '');
            $optB = trim($row[$colOptB] ?? '');
            $optC = $colOptC !== null ? trim($row[$colOptC] ?? '') : '';
            $optD = $colOptD !== null ? trim($row[$colOptD] ?? '') : '';
            $rawCorrect = strtoupper(trim($row[$colCorrect] ?? 'A'));
            $points = $colPoints !== null && is_numeric($row[$colPoints] ?? null) ? (int) $row[$colPoints] : 5;
            $explanation = $colExplanation !== null ? trim($row[$colExplanation] ?? '') : null;

            if ($prompt === '' || $optA === '' || $optB === '') {
                $errors[] = "Row {$rowIndex}: Missing question text or choices.";

                continue;
            }

            // Standardize correct option letter
            $correctKey = match ($rawCorrect) {
                '1', 'A', 'OPTION_A' => 'a',
                '2', 'B', 'OPTION_B' => 'b',
                '3', 'C', 'OPTION_C' => 'c',
                '4', 'D', 'OPTION_D' => 'd',
                default => 'a',
            };

            $options = [
                ['id' => 'a', 'text' => $optA, 'is_correct' => ($correctKey === 'a')],
                ['id' => 'b', 'text' => $optB, 'is_correct' => ($correctKey === 'b')],
            ];

            if ($optC !== '') {
                $options[] = ['id' => 'c', 'text' => $optC, 'is_correct' => ($correctKey === 'c')];
            }
            if ($optD !== '') {
                $options[] = ['id' => 'd', 'text' => $optD, 'is_correct' => ($correctKey === 'd')];
            }

            $quiz->questions()->create([
                'prompt' => $prompt,
                'points' => $points,
                'explanation' => $explanation,
                'options' => $options,
                'order' => $order++,
                'type' => 'multiple_choice',
            ]);

            $imported++;
        }

        fclose($handle);

        return ['imported' => $imported, 'errors' => $errors];
    }

    /**
     * Find header column index by alias list.
     */
    protected function findColIndex(array $header, array $aliases): ?int
    {
        foreach ($aliases as $alias) {
            $idx = array_search(strtolower($alias), $header);
            if ($idx !== false) {
                return $idx;
            }
        }

        return null;
    }

    /**
     * Authorize staff actions (Admin, Instructor, Coordinator).
     */
    protected function authorizeStaff(): void
    {
        /** @var User $user */
        $user = Auth::user();
        if (! ($user->isAdmin() || $user->isInstructor() || $user->isAcademicCoordinator())) {
            abort(403, 'Unauthorized. Staff privileges required.');
        }
    }
}
