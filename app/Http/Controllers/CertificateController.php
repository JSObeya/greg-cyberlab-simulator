<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Services\Export\SafeCsvExportService;
use App\Models\Attempt;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    /**
     * Public verification page with unguessable token. No private PII exposed.
     */
    public function verify(string $token): Response
    {
        $certificate = Certificate::with(['user', 'course'])
            ->where('verification_token', $token)
            ->firstOrFail();

        return Inertia::render('Certificate/Verify', [
            'certificate' => [
                'certificate_number' => $certificate->certificate_number,
                'recipient_name' => $certificate->user->name,
                'course_title' => $certificate->course->title,
                'issued_date' => $certificate->issued_date->format('F d, Y'),
                'is_valid' => true,
            ],
        ]);
    }

    /**
     * Safe CSV Export for Instructors / Administrators.
     */
    public function exportCsv(Request $request): HttpResponse
    {
        $attempts = Attempt::with(['user', 'laboratory'])->get();

        $headers = ['Attempt ID', 'Trainee Name', 'Email', 'Laboratory Title', 'Final Score', 'Status', 'Submitted At'];
        $rows = [];

        foreach ($attempts as $attempt) {
            $rows[] = [
                $attempt->id,
                $attempt->user->name,
                $attempt->user->email,
                $attempt->laboratory->title,
                $attempt->final_score . '%',
                $attempt->status->value,
                $attempt->submitted_at ? $attempt->submitted_at->toDateTimeString() : 'In Progress',
            ];
        }

        $csv = SafeCsvExportService::generate($headers, $rows);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="greg-cyberlab-results-' . date('Y-m-d') . '.csv"',
        ]);
    }
}
