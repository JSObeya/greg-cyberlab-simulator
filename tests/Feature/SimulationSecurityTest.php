<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Laboratory;
use App\Models\User;
use App\Services\Export\SafeCsvExportService;
use App\Services\Simulation\TerminalEngineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SimulationSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_terminal_safely_rejects_unallowed_commands_without_executing_os_processes(): void
    {
        $trainee = User::where('role', 'trainee')->first();
        $lab = Laboratory::where('slug', 'lab-06-file-hashes-integrity-verification')->first();

        $attempt = Attempt::create([
            'user_id' => $trainee->id,
            'laboratory_id' => $lab->id,
        ]);

        $service = new TerminalEngineService();

        // Attempt prohibited or dangerous commands
        $dangerousResult = $service->evaluateCommand($attempt, 'rm -rf /');
        $this->assertFalse($dangerousResult['allowed']);
        $this->assertStringContainsString('command not recognized', $dangerousResult['output']);

        // Check allowed command
        $allowedResult = $service->evaluateCommand($attempt, 'sha256sum updater.bin');
        $this->assertTrue($allowedResult['allowed']);
        $this->assertStringContainsString('updater.bin', $allowedResult['output']);
    }

    public function test_safe_csv_export_prevents_spreadsheet_formula_injection(): void
    {
        $maliciousPayload = "=cmd|' /C calc'!A0";
        $escaped = SafeCsvExportService::escapeField($maliciousPayload);

        // Ensures leading dangerous character is escaped with single quote
        $this->assertStringStartsWith("'", $escaped);
        $this->assertEquals("'" . $maliciousPayload, $escaped);
    }
}
