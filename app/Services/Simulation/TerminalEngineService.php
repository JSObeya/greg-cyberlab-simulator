<?php

namespace App\Services\Simulation;

use App\Models\Attempt;
use App\Models\AttemptCommand;
use App\Models\Laboratory;

class TerminalEngineService
{
    /**
     * Parse and execute a simulated terminal command safely.
     * ZERO calls to shell_exec, exec, system, passthru, proc_open, SSH, etc.
     */
    public function evaluateCommand(Attempt $attempt, string $rawCommand): array
    {
        $trimmed = trim($rawCommand);

        if (empty($trimmed)) {
            return [
                'command' => '',
                'output' => '',
                'allowed' => true,
                'exit_code' => 0,
            ];
        }

        // Split into base command and arguments safely
        $parts = preg_split('/\s+/', $trimmed);
        $baseCmd = strtolower($parts[0]);
        $args = array_slice($parts, 1);

        $lab = $attempt->laboratory;
        $scenario = $lab->scenario;
        $allowedMap = $scenario?->allowed_commands ?? [];

        // Check if full command matches an explicit rule first
        if (isset($allowedMap[$trimmed])) {
            $output = $allowedMap[$trimmed];
            $this->logCommand($attempt, $trimmed, true, $output);
            return [
                'command' => $trimmed,
                'output' => $output,
                'allowed' => true,
                'exit_code' => 0,
            ];
        }

        // Standard built-in simulated Linux utility handling
        $simulatedOutput = match ($baseCmd) {
            'clear' => '__CLEAR__',
            'whoami' => 'analyst',
            'pwd' => '/home/analyst',
            'date' => date('D M d H:i:s T Y'),
            'uname' => (in_array('-a', $args) ? 'Linux kali 6.6.9-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.9-1kali1 x86_64 GNU/Linux' : 'Linux'),
            'hostname' => 'greg-soc-workstation',
            'id' => 'uid=1000(analyst) gid=1000(analyst) groups=1000(analyst),27(sudo),100(users)',
            'history' => $this->getCommandHistory($attempt),
            'help' => "Simulated Kali Linux Terminal\nSupported tools: ls, pwd, cat, grep, ip, ping, ss, dig, nslookup, whois, nmap, sha256sum, file, curl, clear\nNote: All commands execute in safe educational simulation sandbox.",
            default => null,
        };

        if ($simulatedOutput !== null) {
            $this->logCommand($attempt, $trimmed, true, $simulatedOutput);
            return [
                'command' => $trimmed,
                'output' => $simulatedOutput,
                'allowed' => true,
                'exit_code' => 0,
            ];
        }

        // Check configured allowed prefix/regex commands
        foreach ($allowedMap as $pattern => $response) {
            if (fnmatch($pattern, $trimmed, FNM_CASEFOLD)) {
                $this->logCommand($attempt, $trimmed, true, $response);
                return [
                    'command' => $trimmed,
                    'output' => $response,
                    'allowed' => true,
                    'exit_code' => 0,
                ];
            }
        }

        // If not in allowed map and not standard, safely reject
        $rejectedOutput = "bash: {$baseCmd}: command not recognized in this lab scenario or prohibited by security policy.\nType 'help' for guidance.";
        $this->logCommand($attempt, $trimmed, false, $rejectedOutput);

        return [
            'command' => $trimmed,
            'output' => $rejectedOutput,
            'allowed' => false,
            'exit_code' => 127,
        ];
    }

    protected function getCommandHistory(Attempt $attempt): string
    {
        $commands = $attempt->commands()->orderBy('executed_at')->pluck('command');
        $lines = [];
        foreach ($commands as $index => $cmd) {
            $lines[] = sprintf('%4d  %s', $index + 1, $cmd);
        }
        return implode("\n", $lines) ?: "   1  help";
    }

    protected function logCommand(Attempt $attempt, string $command, bool $allowed, string $output): void
    {
        AttemptCommand::create([
            'attempt_id' => $attempt->id,
            'command' => $command,
            'was_allowed' => $allowed,
            'simulated_output' => $output,
            'executed_at' => now(),
        ]);
    }
}
