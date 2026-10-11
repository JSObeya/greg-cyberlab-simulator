<?php

namespace Database\Seeders;

use App\Enums\LabStatus;
use App\Enums\UserRole;
use App\Models\Badge;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\Laboratory;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Question;
use App\Models\Scenario;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Core Users
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@gregcyberlab.test'],
            [
                'name' => 'Dr. Greg Obeya',
                'password' => Hash::make('CyberAdmin2026!'),
                'role' => UserRole::SUPER_ADMIN,
                'phone' => '+234 803 000 1122',
                'is_active' => true,
            ]
        );

        $instructor1 = User::updateOrCreate(
            ['email' => 'instructor@gregcyberlab.test'],
            [
                'name' => 'Engr. Theresa Iorliam',
                'password' => Hash::make('Instructor2026!'),
                'role' => UserRole::INSTRUCTOR,
                'phone' => '+234 802 111 2233',
                'is_active' => true,
            ]
        );

        $trainee1 = User::updateOrCreate(
            ['email' => 'student@gregcyberlab.test'],
            [
                'name' => 'Emmanuel Ameh',
                'password' => Hash::make('Trainee2026!'),
                'role' => UserRole::TRAINEE,
                'phone' => '+234 805 222 3344',
                'is_active' => true,
            ]
        );

        // 2. Badges
        Badge::updateOrCreate(
            ['slug' => 'first-lab-completed'],
            ['name' => 'First Breach Contained', 'description' => 'Successfully passed your first cybersecurity simulation lab.', 'icon' => 'shield-check']
        );
        Badge::updateOrCreate(
            ['slug' => 'apprentice-analyst'],
            ['name' => 'Apprentice SOC Analyst', 'description' => 'Completed 5 cybersecurity laboratories with passing marks.', 'icon' => 'award']
        );
        Badge::updateOrCreate(
            ['slug' => 'cyber-defender'],
            ['name' => 'Certified Cyber Defender', 'description' => 'Mastered all 15 curriculum cybersecurity laboratory simulations.', 'icon' => 'medal']
        );

        // 3. Course, Cohort & Enrollment
        $course = Course::updateOrCreate(
            ['slug' => 'cybersecurity-fundamentals-soc-triage'],
            [
                'title' => 'Cybersecurity Fundamentals & SOC Triage Practical Operations',
                'description' => 'Hands-on practical training covering safe cybersecurity hygiene, terminal investigation, packet forensics, log auditing, email triage, and incident response.',
                'level' => 'beginner_to_intermediate',
                'is_published' => true,
            ]
        );

        $cohort = Cohort::updateOrCreate(
            ['code' => 'MAK-2026-ALPHA'],
            [
                'course_id' => $course->id,
                'name' => 'Makurdi Cyber Cadets - Cohort Alpha 2026',
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->addMonths(3)->endOfMonth(),
                'is_active' => true,
            ]
        );

        $cohort->users()->syncWithoutDetaching([$trainee1->id]);

        // 4. Learning Modules
        $mod1 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'cyber-foundations-hygiene'],
            ['title' => 'Module 1: Cyber Foundations & Defensive Hygiene', 'order' => 1]
        );
        $mod2 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'terminal-network-discovery'],
            ['title' => 'Module 2: Simulated Terminal & Network Discovery', 'order' => 2]
        );
        $mod3 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'log-packet-forensics'],
            ['title' => 'Module 3: Log Auditing & Packet Capture Forensics', 'order' => 3]
        );
        $mod4 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'soc-triage-incident-response'],
            ['title' => 'Module 4: SOC Alert Triage & Incident Response', 'order' => 4]
        );

        // 5. Seed All 15 Comprehensive Laboratories
        $labsData = $this->getLabsData();

        foreach ($labsData as $index => $item) {
            $lesson = Lesson::updateOrCreate(
                ['module_id' => $item['module_id'] == 1 ? $mod1->id : ($item['module_id'] == 2 ? $mod2->id : ($item['module_id'] == 3 ? $mod3->id : $mod4->id)), 'slug' => 'lesson-' . ($index + 1)],
                ['title' => 'Lesson ' . ($index + 1) . ': ' . $item['title'], 'order' => $index + 1]
            );

            $lab = Laboratory::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'course_id' => $course->id,
                    'lesson_id' => $lesson->id,
                    'title' => $item['title'],
                    'category' => $item['category'],
                    'difficulty' => $item['difficulty'],
                    'estimated_minutes' => $item['estimated_minutes'],
                    'passing_score' => $item['passing_score'] ?? 70,
                    'max_attempts' => 3,
                    'status' => LabStatus::PUBLISHED,
                    'primary_workspace' => $item['primary_workspace'] ?? 'general_workbench',
                    'version' => $item['version'] ?? '1.0.0',
                    'scenario_background' => $item['scenario_background'],
                    'theory_notes' => $item['theory_notes'] ?? null,
                    'vocabulary' => $item['vocabulary'] ?? [],
                    'learning_objectives' => $item['learning_objectives'],
                    'safety_notice' => $item['safety_notice'] ?? 'SAFETY NOTICE: This simulation executes entirely in an educational software sandbox. No actual operating system commands are run, and no external networks are targeted.',
                    'safety_scope' => $item['safety_scope'] ?? null,
                    'instructions' => $item['instructions'],
                    'tasks' => $item['tasks'] ?? [],
                    'evidence_requirements' => $item['evidence_requirements'] ?? [],
                    'readiness_questions' => $item['readiness_questions'] ?? [],
                    'expected_findings' => $item['expected_findings'],
                    'rubric' => $item['rubric'] ?? [],
                    'debrief_content' => $item['debrief_content'] ?? null,
                    'prerequisites' => $item['prerequisites'] ?? [],
                    'remediation_explanation' => $item['remediation_explanation'],
                    'instructor_guide' => $item['instructor_guide'] ?? 'Verify trainee methodology. Ensure they evaluate evidence logically rather than guessing.',
                    'workbench_config' => $item['workbench_config'] ?? [],
                ]
            );

            // Configure Scenario & Terminal Allowed Commands
            Scenario::updateOrCreate(
                ['laboratory_id' => $lab->id],
                [
                    'title' => $lab->title . ' Scenario',
                    'initial_state' => ['status' => 'initialized'],
                    'network_topology' => $item['network_topology'] ?? null,
                    'allowed_commands' => $item['allowed_commands'] ?? [],
                ]
            );

            // Seed Questions
            foreach ($item['questions'] as $qIndex => $qData) {
                Question::updateOrCreate(
                    ['laboratory_id' => $lab->id, 'order' => $qIndex + 1],
                    [
                        'type' => $qData['type'] ?? 'multiple_choice',
                        'prompt' => $qData['prompt'],
                        'points' => 20,
                        'options' => $qData['options'] ?? [],
                        'correct_answer_explanation' => $qData['correct_answer_explanation'] ?? 'Consult the laboratory evidence to verify.',
                    ]
                );
            }
        }
    }

    protected function getLabsData(): array
    {
        return [
            // Lab 1: Authoritative Curriculum Definition
            [
                'module_id' => 1,
                'slug' => 'lab-01-orientation-rules',
                'title' => 'Laboratory 1: Cybersecurity Laboratory Orientation and Rules',
                'category' => 'general',
                'difficulty' => 'beginner',
                'estimated_minutes' => 60,
                'passing_score' => 80,
                'primary_workspace' => 'orientation_console',
                'version' => '1.0.0',
                'scenario_background' => 'You have joined the fictional GregSOC trainee team. Before receiving access to the training network, you must review the engagement brief and make correct decisions about five proposed activities.',
                'theory_notes' => "Cybersecurity work is lawful only when it is authorised, limited to an agreed scope, and performed with care. A training laboratory therefore begins with rules of engagement rather than tools. Scope identifies the systems, accounts, dates and actions that are permitted. Anything outside that scope is prohibited.\n\nConfidentiality, integrity and availability provide a simple way to describe what security protects. Confidentiality prevents unauthorised disclosure, integrity prevents unauthorised alteration, and availability keeps systems usable. Trainees must also protect evidence: record what was observed, preserve timestamps and avoid changing source data unnecessarily.\n\nThe simulator is a closed educational environment. Its terminal, hosts, alerts and network traffic are fictional. Trainees must never copy a command from the simulator and use it against an organisation or Internet host without written authorisation.",
                'vocabulary' => ['authorisation', 'scope', 'rules of engagement', 'evidence', 'CIA triad'],
                'learning_objectives' => "• Explain authorisation, scope and rules of engagement\n• Classify actions as permitted, prohibited or requiring instructor approval\n• Recognise the confidentiality, integrity and availability objectives\n• Create a basic laboratory evidence record",
                'instructions' => "1. Open the engagement brief and identify the authorised subnet, start time, end time and approved tools.\n2. Sort each activity card into Permitted, Prohibited or Ask the Instructor.\n3. Match confidentiality, integrity and availability to three short incidents.\n4. Complete an evidence entry containing date, time, trainee, source, observation and action.\n5. Accept the safety acknowledgement and submit the lab.",
                'safety_scope' => [
                    'authorised_subnet' => '192.168.50.0/24',
                    'window_start' => '09:00 UTC',
                    'window_end' => '17:00 UTC',
                    'approved_tools' => ['Simulated Terminal', 'Pre-approved Scanners'],
                    'in_scope' => [
                        'Fictional training subnet 192.168.50.0/24',
                        'Assigned virtual workstation assets',
                        'Simulated packet metadata and logs',
                    ],
                    'out_of_scope' => [
                        'Hostinger server operating system and cPanel/SSH',
                        'External Internet websites and public IP addresses',
                        'Other trainees accounts and production academy servers',
                    ],
                    'rules_of_engagement' => 'All activity must remain inside the simulator engine. Trainees must never run simulator commands or scripts against external hosts without written authorisation.',
                ],
                'tasks' => [
                    ['id' => 1, 'title' => 'Engagement Scope Review', 'desc' => 'Identify the authorised subnet, scheduled window, and approved tools.'],
                    ['id' => 2, 'title' => 'Readiness Check', 'desc' => 'Answer the 4 foundational questions derived from the curriculum notes.'],
                    ['id' => 3, 'title' => 'Activity Classification', 'desc' => 'Sort the 5 activity cards into Permitted, Prohibited, or Ask the Instructor.'],
                    ['id' => 4, 'title' => 'CIA Triad Alignment', 'desc' => 'Match each incident card to Confidentiality, Integrity, or Availability.'],
                    ['id' => 5, 'title' => 'Evidence Worksheet & Safety Sign-off', 'desc' => 'Record an evidence observation vs conclusion and sign the digital safety policy.'],
                ],
                'evidence_requirements' => [
                    'Completed task selections and answers',
                    'At least two cited scenario evidence items',
                    'A concise explanation distinguishing observation from conclusion',
                    'The final worksheet or report required by the scenario',
                ],
                'expected_findings' => "• Only the fictional training subnet is in scope\n• External websites, the Hostinger server operating system and other trainees accounts are out of scope\n• Evidence entries distinguish an observation from an assumption",
                'rubric' => [
                    ['criterion' => 'Scope identification', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'scope_identification'],
                    ['criterion' => 'Activity classification', 'max_marks' => 30, 'is_deterministic' => true, 'key' => 'activity_classification'],
                    ['criterion' => 'CIA matching', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'cia_matching'],
                    ['criterion' => 'Evidence record', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'evidence_record'],
                    ['criterion' => 'Safety acknowledgement', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'safety_acknowledgement'],
                ],
                'readiness_questions' => [
                    [
                        'id' => 1,
                        'question' => 'Under what core conditions is cybersecurity assessment work lawful?',
                        'options' => [
                            'When authorised, limited to an agreed scope, and performed with care',
                            'Whenever an open TCP port is discovered',
                            'If the analyst uses a privacy VPN',
                            'As long as passwords are not changed',
                        ],
                        'correct_index' => 0,
                        'explanation' => 'Cybersecurity work is lawful only when it is explicitly authorised, limited to an agreed scope, and performed with care.',
                    ],
                    [
                        'id' => 2,
                        'question' => 'Which pillar of the CIA triad prevents unauthorised disclosure of sensitive data?',
                        'options' => [
                            'Integrity',
                            'Confidentiality',
                            'Availability',
                            'Non-repudiation',
                        ],
                        'correct_index' => 1,
                        'explanation' => 'Confidentiality prevents unauthorised disclosure, integrity prevents alteration, and availability keeps systems usable.',
                    ],
                    [
                        'id' => 3,
                        'question' => 'What is the required handling procedure for digital evidence in the simulator?',
                        'options' => [
                            'Modify files immediately to repair vulnerabilities',
                            'Record what was observed, preserve timestamps, and avoid altering source data unnecessarily',
                            'Delete log files after reading them',
                            'Upload logs to public analysis forums',
                        ],
                        'correct_index' => 1,
                        'explanation' => 'Evidence integrity requires preserving timestamps, recording observations, and never altering source data unnecessarily.',
                    ],
                    [
                        'id' => 4,
                        'question' => 'Why are external internet addresses and the Hostinger server operating system out of scope?',
                        'options' => [
                            'Because the simulator is a closed educational sandbox using fictional assets only',
                            'Because external sites lack domain names',
                            'Because network sockets are disabled on weekends',
                            'Because HTTP does not support IP addresses',
                        ],
                        'correct_index' => 0,
                        'explanation' => 'The simulator is a strictly closed educational environment with purely fictional assets; testing external systems is out-of-scope and unlawful.',
                    ],
                ],
                'debrief_content' => "Laboratory 1 Debrief & Model Solution:\n• Scope defines the lawful boundary of every security operation. The fictional 192.168.50.0/24 subnet was the only permitted target.\n• Prohibited activities included testing the hosting environment or probing external Internet addresses.\n• Distinguishing raw empirical observations from analytical conclusions is fundamental to reliable security reporting.\n• Achieving 80% or higher is mandatory to unlock subsequent hands-on simulation laboratories.",
                'prerequisites' => [],
                'remediation_explanation' => 'Testing outside the authorized scope without explicit written consent is unlawful under the Nigerian Cybercrimes (Prohibition, Prevention, etc.) Act and international cybersecurity statutes.',
                'instructor_guide' => 'Begin with a short demonstration, then allow trainees to work without revealing the answer key. Release the debrief only after submission.',
                'workbench_config' => [
                    'activity_cards' => [
                        [
                            'id' => 'card_port_scan_in_scope',
                            'title' => 'Scheduled Subnet Port Scan',
                            'description' => 'Port scan within assigned 192.168.50.0/24 during the scheduled 09:00-17:00 UTC lab window using approved simulated tool.',
                            'correct_category' => 'permitted',
                        ],
                        [
                            'id' => 'card_bruteforce_hostinger_cpanel',
                            'title' => 'Host Server SSH / cPanel Login Attack',
                            'description' => 'Attempting brute force login against hostinger server cPanel or host server SSH port.',
                            'correct_category' => 'prohibited',
                        ],
                        [
                            'id' => 'card_external_link_probe',
                            'title' => 'Probing External Internet Domain',
                            'description' => 'Testing an external internet web address mentioned in a simulated phishing email.',
                            'correct_category' => 'prohibited',
                        ],
                        [
                            'id' => 'card_unlisted_vuln_script',
                            'title' => 'Unlisted Assessment Script Execution',
                            'description' => 'Running a new vulnerability assessment script not listed in the engagement brief against 192.168.50.15.',
                            'correct_category' => 'ask_instructor',
                        ],
                        [
                            'id' => 'card_capture_http_headers',
                            'title' => 'Capturing In-Scope HTTP Response Headers',
                            'description' => 'Capturing and saving simulated HTTP headers from virtual host 192.168.50.10 into evidence log.',
                            'correct_category' => 'permitted',
                        ],
                    ],
                    'cia_incidents' => [
                        [
                            'id' => 'incident_unauth_data_leak',
                            'title' => 'Student Records Public Exposure',
                            'description' => 'A student database export file containing private home addresses and phone numbers was left publicly readable on an unauthenticated web directory.',
                            'correct_objective' => 'confidentiality',
                        ],
                        [
                            'id' => 'incident_grade_tampering',
                            'title' => 'Unauthorized Exam Grade Modification',
                            'description' => 'An unauthorized script modified student exam marks in the grade database without any instructor approval.',
                            'correct_objective' => 'integrity',
                        ],
                        [
                            'id' => 'incident_auth_portal_dos',
                            'title' => 'Authentication Gateway Flood Outage',
                            'description' => 'A flood of high-volume synthetic requests overwhelmed the academy authentication gateway, preventing trainees from logging in.',
                            'correct_objective' => 'availability',
                        ],
                    ],
                ],
                'allowed_commands' => [
                    'help' => "Welcome to Greg Cyberlab orientation sandbox.\nRules of Engagement: Authorized testing only.\nType 'id' or 'whoami' to inspect your current profile.",
                ],
                'questions' => [
                    [
                        'prompt' => 'Which component of the CIA triad is violated when ransomware encrypts sensitive corporate files so they cannot be accessed?',
                        'options' => [
                            ['id' => 'a', 'text' => 'Confidentiality', 'is_correct' => false],
                            ['id' => 'b', 'text' => 'Integrity', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'Availability', 'is_correct' => true, 'explanation' => 'Availability ensures authorized users have timely access to information.'],
                            ['id' => 'd', 'text' => 'Non-repudiation', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 2
            [
                'module_id' => 1,
                'slug' => 'lab-02-identifying-assets-threats-risks',
                'title' => 'Lab 02: Identifying Assets, Threats, Vulnerabilities, and Risks',
                'category' => 'general',
                'difficulty' => 'beginner',
                'estimated_minutes' => 30,
                'scenario_background' => 'The Makurdi Agro-Allied Corporation operates an unpatched Windows workstation, an exposed SQL database, and customer web servers. You must calculate risk ratings (Risk = Threat x Vulnerability x Impact).',
                'learning_objectives' => 'Differentiate between Assets, Vulnerabilities, Threats, and Risks.',
                'instructions' => 'Analyze the target corporate assets inventory and classify vulnerabilities according to likelihood and impact.',
                'expected_findings' => 'Direct Internet exposure of the MySQL customer database represents a Critical risk.',
                'remediation_explanation' => 'Move database instances behind internal firewalls and strictly allow access only from authorized web application tiers.',
                'questions' => [
                    [
                        'prompt' => 'In risk management terminology, what is a "vulnerability"?',
                        'options' => [
                            ['id' => 'a', 'text' => 'An active cyber attacker', 'is_correct' => false],
                            ['id' => 'b', 'text' => 'A weakness or flaw in software, hardware, or process that can be exploited', 'is_correct' => true],
                            ['id' => 'c', 'text' => 'Financial damage after an attack', 'is_correct' => false],
                            ['id' => 'd', 'text' => 'The value of a server', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 3
            [
                'module_id' => 1,
                'slug' => 'lab-03-strong-passwords-mfa',
                'title' => 'Lab 03: Strong Passwords and Multi-Factor Authentication',
                'category' => 'general',
                'difficulty' => 'beginner',
                'estimated_minutes' => 30,
                'scenario_background' => 'A breach occurred because an employee used "Password123" without two-step verification. Evaluate entropy and select optimal MFA solutions.',
                'learning_objectives' => 'Compare password cracking feasibility and understand MFA factors (something you know, have, are).',
                'instructions' => 'Examine password hashes and evaluate multi-factor authentication implementations.',
                'expected_findings' => 'FIDO2 / WebAuthn hardware keys provide maximum protection against modern adversary-in-the-middle phishing.',
                'remediation_explanation' => 'Enforce mandatory MFA across all administrative and staff portals.',
                'questions' => [
                    [
                        'prompt' => 'Which of the following represents the "something you have" factor in Multi-Factor Authentication?',
                        'options' => [
                            ['id' => 'a', 'text' => 'A secret PIN', 'is_correct' => false],
                            ['id' => 'b', 'text' => 'A fingerprint scan', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'A hardware TOTP authenticator key or smartphone token', 'is_correct' => true],
                            ['id' => 'd', 'text' => 'A mother maiden name answer', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 4: Phishing Workbench
            [
                'module_id' => 1,
                'slug' => 'lab-04-recognising-phishing-emails',
                'title' => 'Lab 4: Recognizing Phishing Emails & Email Spoofing',
                'category' => 'phishing',
                'difficulty' => 'beginner',
                'estimated_minutes' => 35,
                'scenario_background' => 'The finance desk received an urgent email purportedly from the Chief Accountant requesting an urgent wire transfer to an unknown vendor bank account.',
                'learning_objectives' => 'Detect spoofed headers, typosquatted display names, and high-urgency social engineering cues.',
                'instructions' => 'Open the Phishing Analysis Workbench. Inspect the raw email headers, SPF/DKIM flags, and embedded URLs.',
                'expected_findings' => 'Sender is `accountant@greg-acaddemy.ng` (typosquatted with extra "d"), SPF status is SoftFail, and link points to a suspicious redirect.',
                'remediation_explanation' => 'Reject the email, block the sending IP on the email gateway, and enforce DMARC reject policy.',
                'workbench_config' => [
                    'emails' => [
                        [
                            'id' => 'mail-01',
                            'subject' => 'URGENT: Executive Wire Transfer Authorization Needed by 2:00 PM',
                            'sender' => 'Chief Accountant <accountant@greg-acaddemy.ng>',
                            'reply_to' => 'bursar.secure.transfer@gmail.com',
                            'date' => 'Today at 08:42 AM',
                            'spf' => 'SoftFail',
                            'dkim' => 'None',
                            'body' => "Good morning team,\n\nPlease immediately authorize payment of NGN 3,450,000 to the attached contractor account. Executive approval is attached. Complete before 2:00 PM to avoid contract breach.\n\nClick here to review authorization: http://portal.example.test/auth-login?id=992",
                            'is_phishing' => true,
                        ],
                    ],
                ],
                'questions' => [
                    [
                        'prompt' => 'What is the primary indicator that this email is fraudulent?',
                        'options' => [
                            ['id' => 'a', 'text' => 'It was sent in the morning.', 'is_correct' => false],
                            ['id' => 'b', 'text' => 'The domain is typosquatted (greg-acaddemy.ng) and Reply-To is a free Gmail address.', 'is_correct' => true],
                            ['id' => 'c', 'text' => 'The amount is in Naira.', 'is_correct' => false],
                            ['id' => 'd', 'text' => 'It mentions executive approval.', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 5
            [
                'module_id' => 1,
                'slug' => 'lab-05-safe-browsing-suspicious-urls',
                'title' => 'Lab 5: Safe Browsing & Suspicious URL Forensics',
                'category' => 'general',
                'difficulty' => 'beginner',
                'estimated_minutes' => 30,
                'scenario_background' => 'Users report clicking an external link that prompted for Microsoft 365 credentials.',
                'learning_objectives' => 'Dissect URL syntax: scheme, subdomain, second-level domain, TLD, query parameters.',
                'instructions' => 'Analyze the provided URLs without executing or navigating to them.',
                'expected_findings' => 'The URL `http://login.microsoft.com.account-update.xyz/auth` is owned by `account-update.xyz`, not Microsoft.',
                'remediation_explanation' => 'Train users to identify the true Second-Level Domain immediately before the Top-Level Domain.',
                'questions' => [
                    [
                        'prompt' => 'In the URL "https://portal.bank.com.security-verify.test/login", what is the actual registered domain name holding the website?',
                        'options' => [
                            ['id' => 'a', 'text' => 'bank.com', 'is_correct' => false],
                            ['id' => 'b', 'text' => 'portal.bank.com', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'security-verify.test', 'is_correct' => true],
                            ['id' => 'd', 'text' => 'login', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 6: File Hashes
            [
                'module_id' => 1,
                'slug' => 'lab-06-file-hashes-integrity-verification',
                'title' => 'Lab 6: File Hashes and Cryptographic Integrity Verification',
                'category' => 'terminal',
                'difficulty' => 'beginner',
                'estimated_minutes' => 35,
                'scenario_background' => 'A software installer `updater.bin` was downloaded from a mirror server. The official vendor published the expected SHA256 checksum: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Verify whether the file has been tampered with.',
                'learning_objectives' => 'Use `sha256sum` in the simulated Kali terminal to verify file integrity.',
                'instructions' => 'Open the Simulated Kali Terminal. Run `sha256sum updater.bin` and compare with the vendor checksum.',
                'expected_findings' => 'The hash computed from `updater.bin` differs from the official release, indicating a backdoored trojan.',
                'remediation_explanation' => 'Discard the untrusted binary immediately and download exclusively from cryptographically signed official repositories.',
                'allowed_commands' => [
                    'ls -la' => "-rw-r--r-- 1 analyst analyst 1048576 Oct 11 10:15 updater.bin\n-rw-r--r-- 1 analyst analyst     256 Oct 11 10:15 official_hash.txt",
                    'cat official_hash.txt' => "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  updater.bin",
                    'sha256sum updater.bin' => "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4  updater.bin",
                ],
                'questions' => [
                    [
                        'prompt' => 'Did the hash generated for `updater.bin` match the vendor official signature?',
                        'options' => [
                            ['id' => 'a', 'text' => 'Yes, the file is authentic and safe to install.', 'is_correct' => false],
                            ['id' => 'b', 'text' => 'No, the hash does not match, indicating the file was modified or backdoored.', 'is_correct' => true],
                        ],
                    ],
                ],
            ],

            // Lab 7: Linux CLI
            [
                'module_id' => 2,
                'slug' => 'lab-07-basic-linux-commands-kali-terminal',
                'title' => 'Lab 7: Basic Linux Navigation & Command Line Essentials',
                'category' => 'terminal',
                'difficulty' => 'beginner',
                'estimated_minutes' => 35,
                'scenario_background' => 'Navigate directory structures and inspect file permissions using standard Linux commands.',
                'learning_objectives' => 'Practice `pwd`, `ls`, `cd`, `cat`, and `grep`.',
                'instructions' => 'Use the terminal to locate a hidden configuration flag inside `/etc/security`.',
                'expected_findings' => 'Configuration file `conf.d/flag.txt` discovered containing FLAG{KALI_NAV_SUCCESS}.',
                'remediation_explanation' => 'File permission audits prevent unauthorized local privilege escalation.',
                'allowed_commands' => [
                    'ls' => "Documents  Downloads  audit_workspace  scripts",
                    'pwd' => "/home/analyst",
                    'cd audit_workspace' => "",
                    'ls audit_workspace' => "flag.txt  notes.md",
                    'cat audit_workspace/flag.txt' => "FLAG{KALI_NAV_SUCCESS}",
                    'cat flag.txt' => "FLAG{KALI_NAV_SUCCESS}",
                ],
                'questions' => [
                    [
                        'prompt' => 'What was the secret key string stored in `flag.txt`?',
                        'options' => [
                            ['id' => 'a', 'text' => 'FLAG{KALI_NAV_SUCCESS}', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'FLAG{UNAUTHORIZED_ACCESS}', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'ADMIN_ROOT_2026', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 8: IP, Ports & Protocols
            [
                'module_id' => 2,
                'slug' => 'lab-08-ip-addressing-ports-protocols',
                'title' => 'Lab 8: IP Addressing, Ports, Protocols, and Network Services',
                'category' => 'terminal',
                'difficulty' => 'beginner',
                'estimated_minutes' => 35,
                'scenario_background' => 'Understand standard port mappings (22: SSH, 53: DNS, 80: HTTP, 443: HTTPS, 3306: MySQL). Check active listening sockets.',
                'learning_objectives' => 'Utilize `ip addr` and `ss -tulpn` in terminal.',
                'instructions' => 'Inspect network adapters and open sockets on the local workstation.',
                'expected_findings' => 'Workstation IP is `10.10.10.15` and local SSH server is listening on port 22.',
                'remediation_explanation' => 'Disable unneeded listening services to minimize endpoint attack surface.',
                'allowed_commands' => [
                    'ip addr' => "1: lo: <LOOPBACK,UP> mtu 65536 qdisc noqueue state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast state UP\n    inet 10.10.10.15/24 brd 10.10.10.255 scope global eth0",
                    'ss -tulpn' => "Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process\ntcp    LISTEN  0       128      0.0.0.0:22           0.0.0.0:*          users:((\"sshd\",pid=842,fd=3))\ntcp    LISTEN  0       128      127.0.0.1:3306       0.0.0.0:*          users:((\"mysqld\",pid=1024,fd=12))",
                ],
                'questions' => [
                    [
                        'prompt' => 'Which port is the local SSH daemon actively listening on?',
                        'options' => [
                            ['id' => 'a', 'text' => 'Port 22', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'Port 80', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'Port 443', 'is_correct' => false],
                            ['id' => 'd', 'text' => 'Port 3306', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 9: Host Discovery & Nmap
            [
                'module_id' => 2,
                'slug' => 'lab-09-simulated-host-discovery-service-id',
                'title' => 'Lab 9: Simulated Host Discovery & Service Fingerprinting',
                'category' => 'terminal',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'scenario_background' => 'Perform host discovery across the internal training subnet `10.10.10.0/24` to identify active assets and exposed services.',
                'learning_objectives' => 'Execute simulated `ping` and `nmap -sV` scanning against training hosts.',
                'instructions' => 'Run `nmap -sV 10.10.10.50` to fingerprint services running on the internal department server.',
                'expected_findings' => 'Host 10.10.10.50 is exposing an outdated Apache 2.4.49 web server and vsftpd 2.3.4 FTP server.',
                'remediation_explanation' => 'Update Apache and remove vsftpd backdoor version immediately.',
                'allowed_commands' => [
                    'ping -c 3 10.10.10.50' => "PING 10.10.10.50 (10.10.10.50) 56(84) bytes of data.\n64 bytes from 10.10.10.50: icmp_seq=1 ttl=64 time=0.412 ms\n64 bytes from 10.10.10.50: icmp_seq=2 ttl=64 time=0.388 ms\n64 bytes from 10.10.10.50: icmp_seq=3 ttl=64 time=0.405 ms\n--- 10.10.10.50 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss",
                    'nmap -sV 10.10.10.50' => "Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-11 11:00 WAT\nNmap scan report for hr-server.example.test (10.10.10.50)\nHost is up (0.00042s latency).\nNot shown: 997 closed tcp ports (reset)\nPORT     STATE SERVICE VERSION\n21/tcp   open  ftp     vsftpd 2.3.4\n80/tcp   open  http    Apache httpd 2.4.49 ((Unix))\n22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6\n\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .",
                ],
                'questions' => [
                    [
                        'prompt' => 'What FTP service and version was identified on port 21 of 10.10.10.50?',
                        'options' => [
                            ['id' => 'a', 'text' => 'vsftpd 2.3.4', 'is_correct' => true, 'explanation' => 'Identified by simulated service banner.'],
                            ['id' => 'b', 'text' => 'ProFTPD 1.3.5', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'Pure-FTPd', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 10: Network Topology
            [
                'module_id' => 2,
                'slug' => 'lab-10-firewall-rule-analysis-exposure',
                'title' => 'Lab 10: Network Topology & Firewall Exposure Remediation',
                'category' => 'network',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'scenario_background' => 'A visual network diagram shows an exposed corporate DMZ. A rogue RDP port (3389) on a domain controller is exposed directly to the WAN.',
                'learning_objectives' => 'Isolate compromised endpoints and apply stateful firewall filtering.',
                'instructions' => 'Inspect the network topology, identify the vulnerable path, and select the correct firewall rule.',
                'expected_findings' => 'Port 3389 should never be exposed to the public Internet; it must be blocked at the edge router firewall.',
                'remediation_explanation' => 'Block inbound port 3389 from 0.0.0.0/0 and mandate VPN access for remote administration.',
                'network_topology' => [
                    'nodes' => [
                        ['id' => 'wan', 'label' => 'Public Internet', 'type' => 'cloud'],
                        ['id' => 'fw', 'label' => 'Edge Firewall', 'type' => 'firewall'],
                        ['id' => 'dmz', 'label' => 'DMZ Web Server (192.168.1.10)', 'type' => 'server'],
                        ['id' => 'dc', 'label' => 'Domain Controller (192.168.2.5:3389 EXPOSED)', 'type' => 'critical'],
                    ],
                ],
                'questions' => [
                    [
                        'prompt' => 'Which firewall rule remediates the dangerous exposure of the Domain Controller?',
                        'options' => [
                            ['id' => 'a', 'text' => 'DROP Inbound TCP 3389 on WAN Interface', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'ALLOW All TCP Traffic to 192.168.2.5', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'Disable Edge Firewall', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 11: Log Analysis
            [
                'module_id' => 3,
                'slug' => 'lab-11-security-log-analysis',
                'title' => 'Lab 11: Security Log Forensics (Linux Auth & Web Access)',
                'category' => 'logs',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'scenario_background' => 'A brute-force SSH authentication attempt was detected on the production bastion server `10.10.10.5`. Audit `/var/log/auth.log`.',
                'learning_objectives' => 'Analyze failed login patterns, identify attacker IP, and ascertain whether the attack succeeded.',
                'instructions' => 'Use the Log Analysis Workbench to filter authentication events and find the breached account.',
                'expected_findings' => 'Attacker at IP `192.168.50.120` executed 450 failed SSH attempts before successfully guessing password for user `deploy`.',
                'remediation_explanation' => 'Disable password authentication, enforce SSH key pairs, and install Fail2ban rate-limiting.',
                'workbench_config' => [
                    'logs' => [
                        ['timestamp' => '2026-10-11 02:14:01', 'service' => 'sshd', 'message' => 'Failed password for invalid user admin from 192.168.50.120 port 44321 ssh2', 'severity' => 'warning'],
                        ['timestamp' => '2026-10-11 02:14:05', 'service' => 'sshd', 'message' => 'Failed password for invalid user root from 192.168.50.120 port 44322 ssh2', 'severity' => 'warning'],
                        ['timestamp' => '2026-10-11 02:14:12', 'service' => 'sshd', 'message' => 'Failed password for user deploy from 192.168.50.120 port 44323 ssh2', 'severity' => 'warning'],
                        ['timestamp' => '2026-10-11 02:14:28', 'service' => 'sshd', 'message' => 'Accepted password for deploy from 192.168.50.120 port 44329 ssh2', 'severity' => 'critical'],
                    ],
                ],
                'questions' => [
                    [
                        'prompt' => 'Which IP address conducted the SSH brute force attacks and successfully logged into the account "deploy"?',
                        'options' => [
                            ['id' => 'a', 'text' => '192.168.50.120', 'is_correct' => true],
                            ['id' => 'b', 'text' => '10.10.10.5', 'is_correct' => false],
                            ['id' => 'c', 'text' => '127.0.0.1', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 12: Packet Analysis
            [
                'module_id' => 3,
                'slug' => 'lab-12-packet-capture-interpretation',
                'title' => 'Lab 12: Network Packet Capture Forensics & Protocol Inspection',
                'category' => 'packets',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'scenario_background' => 'Analyze captured network frames from an unencrypted HTTP session where credentials were intercepted in cleartext.',
                'learning_objectives' => 'Inspect TCP flags, sequence numbers, and HTTP POST parameters in cleartext.',
                'instructions' => 'Open the Packet Analysis Workbench. Locate frame #4 containing the HTTP POST request to `/api/login`.',
                'expected_findings' => 'Cleartext username `admin` and password `AdminSecret2026!` transmitted without TLS encryption.',
                'remediation_explanation' => 'Mandate HTTPS / TLS 1.3 across all services and redirect all port 80 traffic to 443.',
                'workbench_config' => [
                    'packets' => [
                        ['no' => 1, 'time' => '0.000', 'src' => '10.10.10.20', 'dst' => '10.10.10.80', 'proto' => 'TCP', 'length' => 74, 'info' => '54321 → 80 [SYN] Seq=0 Win=64240'],
                        ['no' => 2, 'time' => '0.002', 'src' => '10.10.10.80', 'dst' => '10.10.10.20', 'proto' => 'TCP', 'length' => 74, 'info' => '80 → 54321 [SYN, ACK] Seq=0 Ack=1 Win=65160'],
                        ['no' => 3, 'time' => '0.003', 'src' => '10.10.10.20', 'dst' => '10.10.10.80', 'proto' => 'TCP', 'length' => 54, 'info' => '54321 → 80 [ACK] Seq=1 Ack=1'],
                        ['no' => 4, 'time' => '0.015', 'src' => '10.10.10.20', 'dst' => '10.10.10.80', 'proto' => 'HTTP', 'length' => 420, 'info' => 'POST /api/login HTTP/1.1 (application/x-www-form-urlencoded: user=admin&pass=AdminSecret2026!)'],
                    ],
                ],
                'questions' => [
                    [
                        'prompt' => 'What was the plaintext password intercepted in packet #4?',
                        'options' => [
                            ['id' => 'a', 'text' => 'AdminSecret2026!', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'Password123', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'It was encrypted via SSL', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 13: Web Security Headers
            [
                'module_id' => 3,
                'slug' => 'lab-13-web-request-http-header-inspection',
                'title' => 'Lab 13: Web Request & Defensive HTTP Security Header Inspection',
                'category' => 'terminal',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 40,
                'scenario_background' => 'Perform an audit of the web application server security headers to mitigate clickjacking, MIME sniffing, and cross-site scripting (XSS).',
                'learning_objectives' => 'Inspect response headers using simulated `curl -I https://portal.example.test`.',
                'instructions' => 'Run `curl -I https://portal.example.test` and identify missing defensive headers.',
                'expected_findings' => 'Headers `X-Frame-Options` and `Content-Security-Policy` are completely missing.',
                'remediation_explanation' => 'Implement `Content-Security-Policy: default-src \'self\'` and `X-Frame-Options: DENY`.',
                'allowed_commands' => [
                    'curl -I https://portal.example.test' => "HTTP/1.1 200 OK\nDate: Sun, 11 Oct 2026 12:00:00 GMT\nServer: Apache/2.4.52 (Ubuntu)\nX-Powered-By: PHP/8.3.0\nSet-Cookie: session=xyz987; Path=/;\nContent-Type: text/html; charset=UTF-8",
                ],
                'questions' => [
                    [
                        'prompt' => 'Which critical defensive header is absent, exposing the portal to clickjacking attacks?',
                        'options' => [
                            ['id' => 'a', 'text' => 'X-Frame-Options', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'Server', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'Content-Type', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 14: Vulnerability Prioritization
            [
                'module_id' => 4,
                'slug' => 'lab-14-vulnerability-assessment-remediation',
                'title' => 'Lab 14: Vulnerability Assessment & CVSS Remediation Prioritization',
                'category' => 'general',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'scenario_background' => 'A vulnerability scan identified 3 issues: CVE-A (CVSS 9.8 Remote Code Execution), CVE-B (CVSS 5.3 Information Disclosure), and CVE-C (CVSS 7.5 Denial of Service). Prioritize patch schedule.',
                'learning_objectives' => 'Calculate CVSS impact and formulate an emergency remediation plan.',
                'instructions' => 'Order the vulnerabilities by patching priority based on exploitability and business impact.',
                'expected_findings' => 'CVE-A (CVSS 9.8 RCE) must be patched immediately within 24 hours.',
                'remediation_explanation' => 'Critical RCE vulnerabilities allow full server compromise without authentication.',
                'questions' => [
                    [
                        'prompt' => 'Which vulnerability demands immediate emergency patching within the first 24 hours?',
                        'options' => [
                            ['id' => 'a', 'text' => 'CVE-A (CVSS 9.8 Remote Code Execution)', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'CVE-B (CVSS 5.3 Info Disclosure)', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'CVE-C (CVSS 7.5 DoS)', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 15: SOC Incident Response
            [
                'module_id' => 4,
                'slug' => 'lab-15-soc-alert-triage-incident-response',
                'title' => 'Lab 15: SOC Alert Triage & Incident Response Lifecycle',
                'category' => 'soc',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 50,
                'scenario_background' => 'Security Operations Center Alert: Mimikatz LSASS credential dumper detected on finance workstation `WKSTN-FIN-04`. Follow NIST 800-61 incident response stages (Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned).',
                'learning_objectives' => 'Triage alerts as True Positive, initiate host network isolation, and preserve memory forensic evidence.',
                'instructions' => 'Review the SOC alert queue, classify alert #SOC-901, and select the containment action.',
                'expected_findings' => 'Alert is a True Positive critical threat. Immediate host containment required.',
                'remediation_explanation' => 'Isolate endpoint from local network, revoke compromised domain user credentials, and restore endpoint from clean gold image.',
                'workbench_config' => [
                    'alerts' => [
                        [
                            'id' => 'SOC-901',
                            'severity' => 'Critical',
                            'title' => 'LSASS Memory Dumping Detected (Mimikatz Signature)',
                            'asset' => 'WKSTN-FIN-04 (10.10.10.88)',
                            'user' => 'corp\\bursar',
                            'status' => 'New',
                            'details' => 'Process procdump.exe accessed process lsass.exe with PROCESS_VM_READ permissions. Mimikatz hash detected.',
                        ],
                    ],
                ],
                'questions' => [
                    [
                        'prompt' => 'How should alert #SOC-901 be triaged?',
                        'options' => [
                            ['id' => 'a', 'text' => 'True Positive (Active Credential Dumping Attempt)', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'False Positive (Standard User Activity)', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'Benign Positive', 'is_correct' => false],
                        ],
                    ],
                    [
                        'prompt' => 'What is the immediate containment action required according to the incident response playbook?',
                        'options' => [
                            ['id' => 'a', 'text' => 'Immediately isolate WKSTN-FIN-04 from the network to stop lateral movement', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'Wait for user to finish work at 5:00 PM', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'Delete all security logs', 'is_correct' => false],
                        ],
                    ],
                ],
            ],
        ];
    }
}
