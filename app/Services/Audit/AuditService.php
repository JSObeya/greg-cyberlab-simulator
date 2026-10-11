<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public static function record(string $action, ?string $entityType = null, ?int $entityId = null, array $payload = []): void
    {
        try {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'payload' => $payload,
            ]);
        } catch (\Throwable $e) {
            // Never let audit log failures interrupt core application flow
            report($e);
        }
    }
}
