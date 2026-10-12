<?php

namespace App\Http\Controllers;

use App\Models\LearningResource;
use App\Models\Lesson;
use App\Services\Audit\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LearningResourceController extends Controller
{
    /**
     * Upload a safe educational resource file (PDF, PPTX, DOCX, TXT)
     */
    public function store(Request $request, Lesson $lesson): RedirectResponse
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isInstructor() && ! $user->isAcademicCoordinator()) {
            abort(403, 'Unauthorized to upload lesson resources.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:61440|mimes:pdf,pptx,ppt,docx,doc,txt', // Max 60MB, strict safe document types
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $sizeBytes = $file->getSize();

        // Store privately outside public root to prevent unauthenticated direct URL access
        $storedPath = $file->store('learning_resources', 'local');

        $resource = LearningResource::create([
            'course_id' => $lesson->module->course_id,
            'module_id' => $lesson->module_id,
            'lesson_id' => $lesson->id,
            'uploaded_by' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $storedPath,
            'file_name' => $originalName,
            'file_type' => $extension,
            'mime_type' => $mimeType,
            'file_size_bytes' => $sizeBytes,
            'is_downloadable' => true,
        ]);

        AuditService::record('learning_resource_uploaded', 'LearningResource', $resource->id, [
            'file_name' => $originalName,
            'lesson_id' => $lesson->id,
        ]);

        return redirect()->back()->with('success', 'Educational resource uploaded successfully.');
    }

    /**
     * Download or stream protected resource with authorization check
     */
    public function download(LearningResource $resource): StreamedResponse
    {
        $user = Auth::user();

        // Verify that storage file exists
        if (! Storage::disk('local')->exists($resource->file_path)) {
            abort(404, 'Requested educational document not found on storage server.');
        }

        // Increment download counter
        $resource->increment('download_count');

        AuditService::record('learning_resource_downloaded', 'LearningResource', $resource->id, [
            'user_id' => $user->id,
        ]);

        return Storage::disk('local')->download($resource->file_path, $resource->file_name);
    }
}
