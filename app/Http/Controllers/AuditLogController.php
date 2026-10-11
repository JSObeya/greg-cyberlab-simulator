<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * System Audit Trail Viewer for Administrators and Auditors.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        if (! $user->isAdmin() && ! $user->isAuditor()) {
            abort(403, 'Unauthorized access to system audit logs.');
        }

        $query = AuditLog::with('user')->latest();

        if ($action = $request->input('action')) {
            $query->where('action', 'like', "%{$action}%");
        }

        if ($entity = $request->input('entity')) {
            $query->where('entity_type', $entity);
        }

        $auditLogs = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/AuditLogs', [
            'auditLogs' => $auditLogs,
            'filters' => $request->only(['action', 'entity']),
        ]);
    }
}
