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

        $coordinator1 = User::updateOrCreate(
            ['email' => 'coordinator@gregcyberlab.test'],
            [
                'name' => 'Dr. Victoria Akpera',
                'password' => Hash::make('Coordinator2026!'),
                'role' => UserRole::ACADEMIC_COORDINATOR,
                'phone' => '+234 803 555 6677',
                'is_active' => true,
            ]
        );

        $ta1 = User::updateOrCreate(
            ['email' => 'ta@gregcyberlab.test'],
            [
                'name' => 'Barnabas Tersoo',
                'password' => Hash::make('Assistant2026!'),
                'role' => UserRole::TEACHING_ASSISTANT,
                'phone' => '+234 807 888 9900',
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

        // 3. Academic Session & Programmes
        $session = \App\Models\AcademicSession::updateOrCreate(
            ['code' => 'AY-2026-27'],
            [
                'name' => '2026/2027 Academic Year (Cohort Alpha & Beta)',
                'start_date' => now()->startOfYear(),
                'end_date' => now()->endOfYear(),
                'is_current' => true,
                'description' => 'Official academic calendar for cybersecurity cohort admissions at Makurdi campus.',
            ]
        );

        $programme = \App\Models\Programme::updateOrCreate(
            ['code' => 'DCD-2026'],
            [
                'title' => 'Diploma in Cyber Defense & SOC Operations',
                'slug' => 'diploma-cyber-defense-soc-operations',
                'department' => 'Cybersecurity Operations & Threat Defense',
                'duration' => '3 Months (Intensive)',
                'delivery_mode' => 'hybrid',
                'coordinator_id' => $coordinator1->id,
                'entry_requirements' => 'Computing fundamentals, basic networking concepts, and ethical commitment.',
                'objectives' => 'Equip trainees with end-to-end capabilities across incident triage, log inspection, terminal defense, and threat analysis.',
                'description' => 'The premier hands-on professional certificate track by Greg & Co. ICT Academy in Makurdi, Benue State.',
                'status' => 'active',
                'is_active' => true,
            ]
        );

        // 4. Course, Cohort & Enrollment
        $course = Course::updateOrCreate(
            ['slug' => 'cybersecurity-fundamentals-soc-triage'],
            [
                'programme_id' => $programme->id,
                'title' => 'Cybersecurity Fundamentals & SOC Triage Practical Operations',
                'code' => 'CYB-101',
                'summary' => 'Comprehensive foundational and intermediate cybersecurity operations training syllabus.',
                'description' => 'Hands-on practical training covering safe cybersecurity hygiene, terminal investigation, packet forensics, log auditing, email triage, and incident response.',
                'level' => 'beginner_to_intermediate',
                'credit_hours' => 4,
                'estimated_duration_hours' => 60,
                'passing_score' => 70,
                'status' => 'published',
                'created_by' => $instructor1->id,
                'approved_by' => $coordinator1->id,
                'published_at' => now(),
                'is_published' => true,
            ]
        );

        $course->instructors()->syncWithoutDetaching([
            $instructor1->id => ['is_primary' => true, 'assigned_at' => now()],
            $ta1->id => ['is_primary' => false, 'assigned_at' => now()],
        ]);

        $cohort = Cohort::updateOrCreate(
            ['code' => 'MAK-2026-ALPHA'],
            [
                'course_id' => $course->id,
                'programme_id' => $programme->id,
                'academic_session_id' => $session->id,
                'name' => 'Makurdi Cyber Cadets - Cohort Alpha 2026',
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->addMonths(3)->endOfMonth(),
                'max_capacity' => 30,
                'status' => 'active',
                'is_active' => true,
            ]
        );

        $cohort->instructors()->syncWithoutDetaching([
            $instructor1->id => ['is_primary' => true, 'assigned_at' => now()],
        ]);

        $cohort->users()->syncWithoutDetaching([
            $trainee1->id => ['enrolled_at' => now(), 'status' => 'active'],
        ]);

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
                [
                    'title' => 'Lesson ' . ($index + 1) . ': ' . $item['title'],
                    'order' => $index + 1,
                    'content' => $item['theory_notes'] ?? null,
                ]
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
                'passing_score' => 70,
                'primary_workspace' => 'risk_board',
                'scenario_background' => 'The Makurdi Agro-Allied Corporation operates an unpatched Windows workstation, an exposed SQL database, and customer web servers. You must calculate risk ratings (Risk = Threat x Vulnerability x Impact).',
                'theory_notes' => "• Asset: An item of commercial or operational value that needs protection.\n• Threat: Any circumstance or actor with the potential to cause harm or loss.\n• Vulnerability: A weakness in design, implementation or operational control.\n• Risk: The potential for loss when a threat exploits a vulnerability (Likelihood x Impact).\n• Controls are classified as Preventive, Detective, or Corrective.",
                'vocabulary' => [
                    ['term' => 'Asset', 'definition' => 'Something of commercial or operational value that must be protected.'],
                    ['term' => 'Vulnerability', 'definition' => 'A weakness or security flaw in design, software or configuration.'],
                    ['term' => 'Threat Actor', 'definition' => 'An individual, botnet, or entity with intent or capability to exploit a vulnerability.'],
                    ['term' => 'Risk Treatment', 'definition' => 'Actions to mitigate, transfer, avoid, or accept identified risks.'],
                ],
                'learning_objectives' => "• Distinguish clearly between assets, threats, vulnerabilities and security controls\n• Calculate risk scores using a standard 5x5 Likelihood x Impact matrix\n• Recommend preventive, detective and corrective controls for critical risks",
                'instructions' => "1. Classify the 5 provided organizational items into Asset, Threat, Vulnerability, or Control.\n2. Complete the Likelihood x Impact risk calculation for the internet-exposed database and default Wi-Fi router.\n3. Formulate evidence-based justification for risk ratings.\n4. Select tiered preventive, detective, and corrective controls.\n5. Draft the formal risk treatment recommendation statement.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Item Classification', 'desc' => 'Categorize each organizational card as an Asset, Threat, Vulnerability, or Control.'],
                    ['id' => 2, 'title' => 'Risk Matrix Calculation', 'desc' => 'Compute Likelihood x Impact scores on the 5x5 matrix.'],
                    ['id' => 3, 'title' => 'Evidence-Based Justification', 'desc' => 'Document empirical justification for the critical rating.'],
                    ['id' => 4, 'title' => 'Defensive Safeguards Selection', 'desc' => 'Assign preventive, detective, and corrective controls.'],
                    ['id' => 5, 'title' => 'Treatment Statement', 'desc' => 'Articulate the executive remediation plan for the highest-risk asset.'],
                ],
                'rubric' => [
                    ['criterion' => 'Item classification', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'correct_classification'],
                    ['criterion' => 'Risk matrix calculation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'risk_calculations'],
                    ['criterion' => 'Evidence-based justification', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'evidence_based_ratings'],
                    ['criterion' => 'Defensive control selection', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'control_selection'],
                    ['criterion' => 'Treatment statement', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'treatment_statement'],
                ],
                'expected_findings' => 'Direct Internet exposure of the MySQL customer database represents a Critical risk requiring urgent network segmentation and query parameterization.',
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
                'passing_score' => 70,
                'primary_workspace' => 'identity_clinic',
                'scenario_background' => 'A breach occurred because an employee used "Password123" without two-step verification. Evaluate entropy and select optimal MFA solutions.',
                'theory_notes' => "• Password Entropy: A measurement of unpredictability based on character set size and length (bits).\n• Passphrases: Multi-word phrases like 'correct-horse-battery-staple' offer high entropy and strong memorability.\n• Authentication Factors: Something you know (knowledge), something you have (possession), something you are (inherence).\n• Phishing-resistant MFA: FIDO2 / WebAuthn cryptographic keys cannot be intercepted via adversary-in-the-middle reverse proxies.",
                'vocabulary' => [
                    ['term' => 'Entropy', 'definition' => 'Measure of password randomness and resistance to brute-force guessing.'],
                    ['term' => 'MFA', 'definition' => 'Multi-Factor Authentication requiring 2 or more distinct factor categories.'],
                    ['term' => 'FIDO2 / WebAuthn', 'definition' => 'Hardware-backed cryptographic authentication immune to phishing relays.'],
                    ['term' => 'Credential Stuffing', 'definition' => 'Automated injection of stolen username/password pairs across unrelated services.'],
                ],
                'learning_objectives' => "• Evaluate password strength and resistance against dictionary and brute-force attacks\n• Classify authentication mechanisms across knowledge, possession, and inherence factors\n• Formulate role-based MFA rollouts and account recovery checklists",
                'instructions' => "1. Rank the sample passwords from weakest to highest entropy.\n2. Explain the severe risk of cross-account credential reuse.\n3. Classify sample credentials into knowledge, possession, or inherence factors.\n4. Design tiered MFA recommendations for Trainee, Instructor, and Admin roles.\n5. Finalize the defensive account onboarding checklist.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Password Entropy Ranking', 'desc' => 'Identify the weakest and highest entropy credentials.'],
                    ['id' => 2, 'title' => 'Credential Reuse Analysis', 'desc' => 'Explain exposure risks stemming from password reuse across platforms.'],
                    ['id' => 3, 'title' => 'Factor Classification', 'desc' => 'Sort passwords, SMS OTP, hardware keys, and biometrics into factor categories.'],
                    ['id' => 4, 'title' => 'Tiered MFA Planning', 'desc' => 'Assign appropriate MFA safeguards to each organizational tier.'],
                    ['id' => 5, 'title' => 'Identity Defense Checklist', 'desc' => 'Establish identity operational security policies.'],
                ],
                'rubric' => [
                    ['criterion' => 'Password evaluation', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'password_evaluation'],
                    ['criterion' => 'Credential reuse explanation', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'reuse_explanation'],
                    ['criterion' => 'Factor classification', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'factor_classification'],
                    ['criterion' => 'Tiered MFA recommendations', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'mfa_recommendations'],
                    ['criterion' => 'Identity checklist', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'checklist'],
                ],
                'expected_findings' => 'FIDO2 / WebAuthn hardware keys provide maximum protection against modern adversary-in-the-middle phishing attacks.',
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
                'passing_score' => 70,
                'primary_workspace' => 'phishing_workbench',
                'scenario_background' => 'The finance desk received an urgent email purportedly from the Chief Accountant requesting an urgent wire transfer to an unknown vendor bank account.',
                'theory_notes' => "• Phishing: Social engineering attacks using deceptive communications to induce disclosure of credentials or financial transfers.\n• Header Inspection: Authentication headers (SPF, DKIM, DMARC) verify sender domain authorization.\n• Display Name Spoofing: Display name shows a legitimate executive, but the actual SMTP `From:` or `Reply-To:` address belongs to a free webmail service or typosquatted domain.",
                'vocabulary' => [
                    ['term' => 'SPF', 'definition' => 'Sender Policy Framework: DNS record listing mail servers authorized to send from a domain.'],
                    ['term' => 'DKIM', 'definition' => 'DomainKeys Identified Mail: Cryptographic signature verifying an email was not tampered in transit.'],
                    ['term' => 'DMARC', 'definition' => 'Domain-based Message Authentication, Reporting & Conformance: Policy enforcing SPF/DKIM validation.'],
                    ['term' => 'Typosquatting', 'definition' => 'Registering misspelled variants of legitimate domain names to mislead targets.'],
                ],
                'learning_objectives' => "• Inspect email headers to identify SPF/DKIM mismatches and Reply-To discrepancies\n• Recognize urgency indicators, emotional manipulation, and deceptive URLs\n• Classify emails into legitimate, suspicious, and confirmed phishing categories",
                'instructions' => "1. Review all 6 email artifacts in the workbench.\n2. Flag suspicious indicators (typosquatting, urgent deadlines, free webmail reply-to).\n3. Analyze SPF authentication results and mismatching headers.\n4. Classify each of the 6 emails into Legitimate, Suspicious, or Phishing.\n5. Record the recommended safe organizational containment actions.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Header & Metadata Inspection', 'desc' => 'Examine From, Reply-To, and SPF verification headers.'],
                    ['id' => 2, 'title' => 'Social Engineering Cue Analysis', 'desc' => 'Identify urgency flags, financial requests, and deceptive links.'],
                    ['id' => 3, 'title' => 'Email Fleet Classification', 'desc' => 'Classify all 6 email artifacts.'],
                    ['id' => 4, 'title' => 'Incident Containment Steps', 'desc' => 'Specify actions to take without clicking or executing attachments.'],
                    ['id' => 5, 'title' => 'Security Analyst Reasoning', 'desc' => 'Document evidence-based rationale for triage findings.'],
                ],
                'rubric' => [
                    ['criterion' => 'Indicator identification', 'max_marks' => 30, 'is_deterministic' => true, 'key' => 'indicator_identification'],
                    ['criterion' => 'Header interpretation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'header_interpretation'],
                    ['criterion' => 'Email classification', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'classification'],
                    ['criterion' => 'Safe response actions', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'safe_response_actions'],
                    ['criterion' => 'Reasoning quality', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'reasoning_quality'],
                ],
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
                'passing_score' => 70,
                'primary_workspace' => 'url_desk',
                'scenario_background' => 'Users report clicking an external link that prompted for Microsoft 365 credentials. Analyze the URL structure safely without network navigation.',
                'theory_notes' => "• URL Syntax: `<scheme>://<hostname>:<port>/<path>?<query>#<fragment>`.\n• Domain Hierarchy: In `portal.bank.com.security-verify.test`, the true registered domain is `security-verify.test`, NOT `bank.com`.\n• HTTPS Fallacy: An HTTPS certificate indicates encrypted transit, NOT that the host or business is trustworthy or benign.\n• RFC 2606 Reserved Domains: `.test`, `.example`, `.invalid`, and `.localhost` are reserved for educational testing and cannot resolve globally.",
                'vocabulary' => [
                    ['term' => 'TLD', 'definition' => 'Top-Level Domain: The rightmost label of a domain name (e.g. .org, .ng, .test).'],
                    ['term' => 'SLD', 'definition' => 'Second-Level Domain: The domain name directly beneath the TLD, identifying the registrant.'],
                    ['term' => 'Subdomain', 'definition' => 'A domain prefix controlled by the domain registrant (e.g., login.microsoft.com.attacker.test).'],
                    ['term' => 'Defanged URL', 'definition' => 'A modified URL format (hxxp[://]) to prevent accidental trainee clicking.'],
                ],
                'learning_objectives' => "• Deconstruct URLs into scheme, hostname, SLD, TLD, path and query parameters\n• Uncover deceptive subdomains, deceptive unicode, and typosquatting tactics\n• Articulate why HTTPS encryption does not validate website authenticity",
                'instructions' => "1. Parse the provided suspicious URL into its protocol, hostname, registered domain, path, and query components.\n2. Flag deceptive indicators such as misleading prefixes or non-standard ports.\n3. Formulate the technical explanation of HTTPS encryption limitations.\n4. Classify the 5 investigation URLs as Safe, Suspicious, or Deceptive.\n5. Outline safe incident response containment steps.",
                'tasks' => [
                    ['id' => 1, 'title' => 'URL Structural Parsing', 'desc' => 'Decompose the URL into scheme, hostname, registered domain, and path.'],
                    ['id' => 2, 'title' => 'Deception Vector Identification', 'desc' => 'Identify misleading subdomains and deceptive query strings.'],
                    ['id' => 3, 'title' => 'HTTPS Limitations Evaluation', 'desc' => 'Explain why transport encryption does not imply server legitimacy.'],
                    ['id' => 4, 'title' => 'URL Classification Matrix', 'desc' => 'Classify the 5 URL test cases.'],
                    ['id' => 5, 'title' => 'Response & Containment Actions', 'desc' => 'Document immediate containment measures.'],
                ],
                'rubric' => [
                    ['criterion' => 'URL structural parsing', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'url_parsing'],
                    ['criterion' => 'Deception vector identification', 'max_marks' => 30, 'is_deterministic' => true, 'key' => 'deception_indicators'],
                    ['criterion' => 'HTTPS limitations explanation', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'https_explanation'],
                    ['criterion' => 'URL classification matrix', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'classification'],
                    ['criterion' => 'Safe containment action', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'safe_action'],
                ],
                'expected_findings' => 'The URL `http://login.microsoft.com.account-update.test/auth` is owned by `account-update.test`, not Microsoft.',
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
                'passing_score' => 70,
                'primary_workspace' => 'integrity_console',
                'scenario_background' => 'A software installer `updater.bin` was downloaded from a mirror server. The official vendor published the expected SHA256 checksum: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Verify whether the file has been tampered with.',
                'theory_notes' => "• Cryptographic Hash Function: A one-way mathematical algorithm converting arbitrary data into a fixed-length string (digest).\n• Core Properties: Deterministic, fast to compute, pre-image resistant, and collision resistant.\n• Avalanche Effect: Altering a single bit in the source file drastically changes the output digest.\n• Common Algorithms: MD5 (deprecated/collisions), SHA-1 (deprecated), SHA-256 (standard secure standard).\n• Chain of Custody: Documenting who collected, computed, and preserved cryptographic evidence.",
                'vocabulary' => [
                    ['term' => 'Digest', 'definition' => 'The fixed-length cryptographic hash string generated from input data.'],
                    ['term' => 'Collision', 'definition' => 'When two distinct inputs produce an identical hash digest (unacceptable in secure algorithms).'],
                    ['term' => 'Chain of Custody', 'definition' => 'Chronological audit trail documenting custody, transfer, and analysis of digital evidence.'],
                    ['term' => 'SHA-256', 'definition' => 'Secure Hash Algorithm producing a 256-bit (64 hexadecimal character) signature.'],
                ],
                'learning_objectives' => "• Execute simulated terminal hash utilities (sha256sum, file, ls)\n• Compare computed digests against official vendor distribution manifests\n• Identify modified or trojanized payloads and establish an evidence chain of custody",
                'instructions' => "1. Use the simulated terminal to run `ls -la` and `sha256sum updater.bin`.\n2. Compare computed digests with `SHA256SUMS` official manifest values.\n3. Determine which file in the mirror was tampered with.\n4. Complete the formal digital chain of custody evidence record.\n5. Recommend operational containment steps for the compromised binary.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Simulated Command Execution', 'desc' => 'Execute sha256sum, ls, and file commands in the virtual terminal.'],
                    ['id' => 2, 'title' => 'Cryptographic Digest Comparison', 'desc' => 'Compare calculated digests with the published vendor checksum manifest.'],
                    ['id' => 3, 'title' => 'Integrity Verification Interpretation', 'desc' => 'Analyze whether the file modification indicates tampering or benign difference.'],
                    ['id' => 4, 'title' => 'Chain of Custody Evidence Record', 'desc' => 'Record file attributes, digest, and handling timestamps.'],
                    ['id' => 5, 'title' => 'Defensive Remediation Action', 'desc' => 'Advise the response protocol for backdoored binary installers.'],
                ],
                'rubric' => [
                    ['criterion' => 'Simulated command selection', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'command_selection'],
                    ['criterion' => 'Cryptographic digest comparison', 'max_marks' => 30, 'is_deterministic' => true, 'key' => 'digest_comparison'],
                    ['criterion' => 'Integrity interpretation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'interpretation'],
                    ['criterion' => 'Chain of custody evidence record', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'evidence_record'],
                    ['criterion' => 'Defensive remediation action', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'recommended_action'],
                ],
                'expected_findings' => 'The hash computed from `updater.bin` differs from the official release, indicating a backdoored trojan.',
                'remediation_explanation' => 'Discard the untrusted binary immediately and download exclusively from cryptographically signed official repositories.',
                'allowed_commands' => [
                    'ls -la' => "-rw-r--r-- 1 analyst analyst 1048576 Oct 11 10:15 updater.bin\n-rw-r--r-- 1 analyst analyst   65536 Oct 11 10:15 docs.pdf\n-rw-r--r-- 1 analyst analyst    4096 Oct 11 10:15 agent.conf\n-rw-r--r-- 1 analyst analyst     256 Oct 11 10:15 SHA256SUMS",
                    'cat SHA256SUMS' => "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  updater.bin\n2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae  docs.pdf\nfcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9  agent.conf",
                    'sha256sum updater.bin' => "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4  updater.bin",
                    'sha256sum docs.pdf' => "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae  docs.pdf",
                    'sha256sum agent.conf' => "fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9  agent.conf",
                    'sha256sum *' => "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4  updater.bin\n2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae  docs.pdf\nfcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9  agent.conf\n9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08  SHA256SUMS",
                    'file updater.bin' => "updater.bin: ELF 64-bit LSB executable, x86-64, dynamically linked",
                    'file docs.pdf' => "docs.pdf: PDF document, version 1.7",
                    'file agent.conf' => "agent.conf: ASCII text",
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
                'passing_score' => 70,
                'primary_workspace' => 'linux_console',
                'scenario_background' => 'Navigate directory structures and inspect file permissions in the simulated Kali Linux environment.',
                'theory_notes' => "• Hierarchical Directory Tree: Root `/`, home directory `/home/<user>`, configuration files `/etc`, and logs in `/var/log`.\n• Standard Navigation Commands: `pwd` (print working directory), `ls -la` (list all files with permissions), `cd` (change directory).\n• Text & File Inspection: `cat` (concatenate and display), `head` (first lines), `grep` (pattern match regular expressions), `file` (determine file format).\n• Security Auditing: Filtering authentication logs (`auth.log`) reveals attacker brute-force intrusion sources.",
                'vocabulary' => [
                    ['term' => 'Working Directory', 'definition' => 'The current location within the filesystem where user commands execute.'],
                    ['term' => 'File Permissions', 'definition' => 'POSIX access rights (read, write, execute) granted to owner, group, and others.'],
                    ['term' => 'Regex Filter', 'definition' => 'Pattern matching using utilities like grep to isolate indicators from extensive logs.'],
                    ['term' => 'Standard Input / Output', 'definition' => 'Data streams connecting terminal processes in Unix-like environments.'],
                ],
                'learning_objectives' => "• Navigate Linux filesystem directories using pwd, ls, and cd\n• Inspect and extract critical strings from text files using cat and grep\n• Isolate failed authentication indicators from simulated security logs",
                'instructions' => "1. Use `pwd` and `ls -la` to inspect the analyst home directory.\n2. Change into `audit_workspace` and display the contents of `flag.txt`.\n3. Search for failed authentication events inside `/var/log/auth.log` using `grep`.\n4. Compute the SHA-256 digest of the discovered flag file.\n5. Document your evidence findings and submit for 100-point rubric scoring.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Directory Navigation Audit', 'desc' => 'Navigate into the audit workspace and confirm working directory path.'],
                    ['id' => 2, 'title' => 'File Inspection & Flag Extraction', 'desc' => 'Inspect flag.txt and record the discovered secret string.'],
                    ['id' => 3, 'title' => 'Log Pattern Filtering', 'desc' => 'Execute grep filters against auth.log to isolate attacker IP addresses.'],
                    ['id' => 4, 'title' => 'Cryptographic Digest Verification', 'desc' => 'Calculate and verify the SHA-256 hash of the evidence flag.'],
                    ['id' => 5, 'title' => 'Evidence Synthesis', 'desc' => 'Synthesize evidence observations and submit for evaluation.'],
                ],
                'rubric' => [
                    ['criterion' => 'Directory navigation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'navigation'],
                    ['criterion' => 'File inspection & flag', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'file_inspection'],
                    ['criterion' => 'Log filtering with grep', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'log_filtering'],
                    ['criterion' => 'Cryptographic hashing', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'hashing'],
                    ['criterion' => 'Permission interpretation', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'permission_interpretation'],
                    ['criterion' => 'Evidence selection', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'evidence_selection'],
                ],
                'expected_findings' => 'Configuration file `audit_workspace/flag.txt` discovered containing FLAG{KALI_NAV_SUCCESS} and failed logins originating from 192.168.50.105.',
                'remediation_explanation' => 'File permission audits prevent unauthorized local privilege escalation.',
                'allowed_commands' => [
                    'ls' => "Documents  Downloads  audit_workspace  scripts",
                    'ls -la' => "drwxr-xr-x 4 analyst analyst 4096 Oct 11 09:00 .\ndrwxr-xr-x 3 root    root    4096 Oct 11 08:30 ..\ndrwxr-xr-x 2 analyst analyst 4096 Oct 11 09:15 audit_workspace\n-rw-r--r-- 1 analyst analyst  220 Oct 11 08:30 .bash_logout",
                    'pwd' => "/home/analyst",
                    'cd audit_workspace' => "",
                    'ls audit_workspace' => "flag.txt  notes.md",
                    'cat audit_workspace/flag.txt' => "FLAG{KALI_NAV_SUCCESS}",
                    'cat flag.txt' => "FLAG{KALI_NAV_SUCCESS}",
                    'grep failed /var/log/auth.log' => "Oct 11 09:14:02 kali sshd[412]: Failed password for invalid user admin from 192.168.50.105 port 49152 ssh2\nOct 11 09:14:05 kali sshd[415]: Failed password for invalid user root from 192.168.50.105 port 49154 ssh2",
                    'grep -i "failed" /var/log/auth.log' => "Oct 11 09:14:02 kali sshd[412]: Failed password for invalid user admin from 192.168.50.105 port 49152 ssh2\nOct 11 09:14:05 kali sshd[415]: Failed password for invalid user root from 192.168.50.105 port 49154 ssh2",
                    'sha256sum audit_workspace/flag.txt' => "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945  audit_workspace/flag.txt",
                    'sha256sum flag.txt' => "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945  flag.txt",
                    'file audit_workspace/flag.txt' => "audit_workspace/flag.txt: ASCII text",
                    'file flag.txt' => "flag.txt: ASCII text",
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
                'passing_score' => 70,
                'primary_workspace' => 'network_diagnostics',
                'scenario_background' => 'Understand standard port mappings (22: SSH, 53: DNS, 80: HTTP, 443: HTTPS, 3306: MySQL). Check active listening sockets.',
                'theory_notes' => "• IPv4 Subnetting: An IP address paired with a subnet mask (e.g. /24 or 255.255.255.0) partitions network and host portions.\n• IANA Port Ranges: Well-known (0–1023), Registered (1024–49151), Dynamic/Private (49152–65535).\n• Core Services: Port 22 (SSH), Port 53 (DNS), Port 80 (HTTP), Port 443 (HTTPS), Port 3306 (MySQL).\n• Socket Binding: Services bound to `0.0.0.0` listen on all network interfaces, whereas `127.0.0.1` restricts access strictly to the local host.",
                'vocabulary' => [
                    ['term' => 'Subnet Mask', 'definition' => 'Bitmask separating the network ID from the host address bits.'],
                    ['term' => 'Listening Socket', 'definition' => 'A local IP and port combination actively waiting for inbound connection requests.'],
                    ['term' => 'Binding Address', 'definition' => 'The specific network interface IP that an application binds to for traffic.'],
                    ['term' => 'Loopback Interface', 'definition' => 'Virtual adapter (127.0.0.1) routing traffic exclusively within the local host.'],
                ],
                'learning_objectives' => "• Inspect network adapter configurations and calculate CIDR host ranges\n• Map transport-layer port numbers to underlying standard application protocols\n• Interpret ss listening sockets to isolate attack surface exposure",
                'instructions' => "1. Inspect workstation IP and subnet mask from `ip addr show eth0`.\n2. Complete the standard protocol mapping table for ports 22, 53, 80, and 443.\n3. Audit active listening sockets using `ss -tulpn`.\n4. Design policy to isolate external SSH and database exposures.\n5. Document your technical rationale and submit the assessment.",
                'tasks' => [
                    ['id' => 1, 'title' => 'IP Addressing & Subnet Analysis', 'desc' => 'Identify workstation IP, CIDR mask, and network boundaries.'],
                    ['id' => 2, 'title' => 'Port & Service Mapping', 'desc' => 'Map ports 22, 53, 80, and 443 to their standard services.'],
                    ['id' => 3, 'title' => 'Listening Socket Audit', 'desc' => 'Identify daemons bound to 0.0.0.0 vs 127.0.0.1.'],
                    ['id' => 4, 'title' => 'Exposure Remediation Policy', 'desc' => 'Enforce least privilege binding and firewall access restrictions.'],
                    ['id' => 5, 'title' => 'Technical Justification', 'desc' => 'Explain the relationship between listening sockets and endpoint attack surface.'],
                ],
                'rubric' => [
                    ['criterion' => 'IP Addressing analysis', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'addressing'],
                    ['criterion' => 'Protocol mapping', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'protocol_mapping'],
                    ['criterion' => 'Command interpretation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'command_interpretation'],
                    ['criterion' => 'Exposure remediation decisions', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'exposure_decisions'],
                    ['criterion' => 'Technical explanation', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'explanation'],
                ],
                'expected_findings' => 'Workstation IP is `10.10.10.15` and local SSH server is listening on port 22.',
                'remediation_explanation' => 'Disable unneeded listening services to minimize endpoint attack surface.',
                'allowed_commands' => [
                    'ip addr' => "1: lo: <LOOPBACK,UP> mtu 65536 qdisc noqueue state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast state UP\n    inet 10.10.10.15/24 brd 10.10.10.255 scope global eth0",
                    'ip addr show eth0' => "2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast state UP\n    inet 10.10.10.15/24 brd 10.10.10.255 scope global eth0",
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
                'passing_score' => 70,
                'primary_workspace' => 'port_scanner',
                'scenario_background' => 'Perform host discovery across the internal training subnet `10.10.10.0/24` to identify active assets and exposed services.',
                'theory_notes' => "• Authorised Discovery: Reconnaissance must strictly adhere to agreed subnet targets and engagement windows.\n• Ping Sweeps: Sending ICMP Echo requests identifies active systems without port scanning.\n• Service Fingerprinting: Utilities like `nmap -sV` inspect response banners to determine exact daemon software names and versions.\n• Backdoor Signatures: Identifying notorious software releases (such as vsftpd 2.3.4 with built-in trigger CVE-2011-2523) requires immediate emergency escalation.",
                'vocabulary' => [
                    ['term' => 'Host Discovery', 'definition' => 'Techniques to determine which IP addresses are active and hosting devices on a subnet.'],
                    ['term' => 'Service Banner', 'definition' => 'Text greeting emitted by a server application when a client establishes a socket connection.'],
                    ['term' => 'Fingerprinting', 'definition' => 'Analyzing application responses to determine exact operating system and software versions.'],
                    ['term' => 'Escalation Notice', 'definition' => 'Formal analyst advisory communicating high-severity vulnerabilities to system administrators.'],
                ],
                'learning_objectives' => "• Conduct host discovery strictly within authorized training scope boundaries\n• Execute simulated ICMP ping sweeps and nmap service version scans\n• Catalog exposed service daemons and recognize hazardous backdoored releases",
                'instructions' => "1. Confirm that target host 10.10.10.50 is in-scope according to the engagement rules.\n2. Run `ping -c 3 10.10.10.50` and interpret packet loss and response latency.\n3. Execute `nmap -sV 10.10.10.50` to fingerprint listening daemons.\n4. Catalog the detected FTP, HTTP, and SSH services.\n5. Document the backdoored vsftpd package and draft the critical escalation advisory.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Scope Verification', 'desc' => 'Validate target IP against rules of engagement.'],
                    ['id' => 2, 'title' => 'Host Liveness Verification', 'desc' => 'Analyze ICMP ping results.'],
                    ['id' => 3, 'title' => 'Service Version Inventory', 'desc' => 'Inventory FTP, HTTP, and SSH services from Nmap output.'],
                    ['id' => 4, 'title' => 'Vulnerability & Backdoor Detection', 'desc' => 'Flag dangerous legacy versions.'],
                    ['id' => 5, 'title' => 'Incident Escalation Advisory', 'desc' => 'Draft the security analyst escalation bulletin.'],
                ],
                'rubric' => [
                    ['criterion' => 'Scope compliance', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'scope_compliance'],
                    ['criterion' => 'Discovery interpretation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'discovery_interpretation'],
                    ['criterion' => 'Service inventory', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'service_inventory'],
                    ['criterion' => 'Unexpected exposure identification', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'unexpected_exposure'],
                    ['criterion' => 'Analyst escalation note', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'escalation_note'],
                ],
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

            // Lab 10: Network Topology & Firewall
            [
                'module_id' => 2,
                'slug' => 'lab-10-firewall-rule-analysis-exposure',
                'title' => 'Lab 10: Network Topology & Firewall Exposure Remediation',
                'category' => 'network',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'passing_score' => 70,
                'primary_workspace' => 'firewall_simulator',
                'scenario_background' => 'A visual network diagram shows an exposed corporate DMZ. A rogue RDP port (3389) on a domain controller is exposed directly to the WAN.',
                'theory_notes' => "• Stateful Packet Inspection: Firewalls evaluate traffic state (NEW, ESTABLISHED, RELATED) against an ordered list of security rules.\n• Order Matters: Rules are evaluated sequentially from top to bottom; the first rule matching traffic triggers and halts further evaluation.\n• Default Deny: Modern network defence enforces an implicit or explicit drop on all inbound traffic not explicitly permitted.\n• Management Port Hardening: Administrative services (RDP 3389, SSH 22, Telnet 23) must never be permitted from 0.0.0.0/0 on WAN interfaces.",
                'vocabulary' => [
                    ['term' => 'Default Deny', 'definition' => 'Security policy principle stating anything not explicitly permitted is blocked.'],
                    ['term' => 'RDP', 'definition' => 'Remote Desktop Protocol (TCP 3389) used for Windows graphical desktop management.'],
                    ['term' => 'DMZ', 'definition' => 'Demilitarized Zone: A perimeter network hosting externally accessible services isolated from LAN.'],
                    ['term' => 'First-Match Rule', 'definition' => 'Firewall processing logic where the first matching filter dictates packet disposition.'],
                ],
                'learning_objectives' => "• Evaluate firewall rulesets to identify dangerous WAN-exposed management ports\n• Apply the principle of least privilege by restricting administrative protocols to authenticated VPNs\n• Formulate formal firewall change tickets with test validation cases",
                'instructions' => "1. Analyze the ordered rules in the Firewall Policy Simulator.\n2. Flag dangerous rules exposing RDP (TCP 3389) and Telnet (TCP 23) to 0.0.0.0/0.\n3. Formulate hardened replacement rules enforcing default-deny and VPN-restricted management.\n4. Verify traffic disposition against test cases.\n5. Complete the change ticket audit record and submit the lab.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Ruleset Traffic Evaluation', 'desc' => 'Inspect ordered rules and trace packet matching flow.'],
                    ['id' => 2, 'title' => 'Unsafe Rule Identification', 'desc' => 'Flag dangerous WAN 0.0.0.0/0 exposure rules.'],
                    ['id' => 3, 'title' => 'Hardened Rule Remediation', 'desc' => 'Draft corrected rules enforcing least privilege.'],
                    ['id' => 4, 'title' => 'Firewall Policy Test Suite', 'desc' => 'Validate traffic allowance and dropping behavior.'],
                    ['id' => 5, 'title' => 'Change Management Record', 'desc' => 'Draft formal change ticket documentation.'],
                ],
                'rubric' => [
                    ['criterion' => 'Traffic flow evaluation', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'traffic_evaluation'],
                    ['criterion' => 'Unsafe rule identification', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'unsafe_rules'],
                    ['criterion' => 'Hardened policy definition', 'max_marks' => 30, 'is_deterministic' => true, 'key' => 'corrected_policy'],
                    ['criterion' => 'Policy test validation', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'policy_tests'],
                    ['criterion' => 'Change management record', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'change_record'],
                ],
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
                'passing_score' => 70,
                'primary_workspace' => 'log_investigation',
                'scenario_background' => 'A brute-force SSH authentication attempt was detected on the production bastion server `10.10.10.5`. Audit `/var/log/auth.log`.',
                'theory_notes' => "• Centralized Logging & SIEM: Security event records are ingested from authentication daemons, web servers, and firewalls.\n• Brute-Force Signatures: Repeated `Failed password` log entries originating from identical source IP addresses over short time intervals.\n• Multi-Source Event Correlation: Matching SSH login events with subsequent web activity by source IP, username, or timestamp.\n• Hardening Against Brute Force: Enforce public-key authentication, disable root login, and implement rate-limiting via Fail2ban.",
                'vocabulary' => [
                    ['term' => 'Log Normalization', 'definition' => 'Standardizing log formats across diverse platforms into consistent timestamp and attribute fields.'],
                    ['term' => 'Event Correlation', 'definition' => 'Associating disparate log records from multiple systems to uncover an overarching attack chain.'],
                    ['term' => 'Bastion Host', 'definition' => 'A fortified gateway server designed to withstand attacks and provide secure access to internal networks.'],
                    ['term' => 'Fail2ban', 'definition' => 'Intrusion prevention software that scans log files and bans IPs exhibiting malicious behaviors.'],
                ],
                'learning_objectives' => "• Filter synthetic authentication logs using string search and regular expressions\n• Correlate attacker IP addresses across multiple authentication attempts\n• Reconstruct a chronological attack timeline and specify operational safeguards",
                'instructions' => "1. Examine the `/var/log/auth.log` stream in the Log Investigation Workbench.\n2. Filter failed authentication events and tally attacker attempts.\n3. Identify the correlated attacker IP and the breached user account.\n4. Reconstruct the chronological incident timeline.\n5. Select defense recommendations (disabling passwords, rotating keys, installing Fail2ban) and submit.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Log Pattern Filtering', 'desc' => 'Filter and quantify failed authentication log entries.'],
                    ['id' => 2, 'title' => 'Cross-Log Correlation', 'desc' => 'Correlate attacker source IP across repeated login events.'],
                    ['id' => 3, 'title' => 'Incident Timeline Construction', 'desc' => 'Build a timestamped sequence of adversary actions.'],
                    ['id' => 4, 'title' => 'Finding Statement', 'desc' => 'Draft a formal security finding describing the breach.'],
                    ['id' => 5, 'title' => 'Defensive Safeguards Selection', 'desc' => 'Select operational containment and remediation safeguards.'],
                ],
                'rubric' => [
                    ['criterion' => 'Log pattern filtering', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'log_filtering'],
                    ['criterion' => 'Cross-log correlation', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'correlation'],
                    ['criterion' => 'Incident timeline construction', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'timeline_accuracy'],
                    ['criterion' => 'Finding statement quality', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'finding_quality'],
                    ['criterion' => 'Defensive safeguards selection', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'response_recommendations'],
                ],
                'expected_findings' => 'Attacker at IP `192.168.50.120` executed failed SSH attempts before successfully guessing password for user `deploy`.',
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
                'passing_score' => 70,
                'primary_workspace' => 'packet_workbench',
                'scenario_background' => 'Analyze captured network frames from an unencrypted HTTP session where credentials were intercepted in cleartext.',
                'theory_notes' => "• Packet Capture (PCAP): Complete byte recordings of frames traversing network interfaces.\n• Transmission Control Protocol (TCP): Connection-oriented transport establishing sessions via a 3-way handshake ([SYN] -> [SYN, ACK] -> [ACK]).\n• Cleartext Interception Risk: Standard HTTP (TCP port 80) transmits headers, cookies, and POST bodies in unencrypted cleartext across intermediate network switches and routers.\n• Transport Layer Security (TLS): Cryptographic encapsulation (TCP port 443) that ensures confidentiality and prevents eavesdropping.",
                'vocabulary' => [
                    ['term' => 'Three-Way Handshake', 'definition' => 'TCP synchronization process using SYN, SYN-ACK, and ACK packet flags.'],
                    ['term' => 'Cleartext Transmission', 'definition' => 'Unencrypted data transfer vulnerable to passive network sniffing and eavesdropping.'],
                    ['term' => 'Frame Inspector', 'definition' => 'Tool for examining individual packet header fields, flags, and payload payloads.'],
                    ['term' => 'TLS Encapsulation', 'definition' => 'Securing application traffic with cryptographic certificates over encrypted transport.'],
                ],
                'learning_objectives' => "• Trace the TCP 3-way handshake sequence across captured packet frames\n• Locate cleartext credentials exposed in unencrypted HTTP POST bodies\n• Document forensic evidence citations and recommend transport security mandates",
                'instructions' => "1. Inspect the captured network frame stream in the Packet Analysis Workbench.\n2. Confirm the 3-way handshake frames (SYN, SYN/ACK, ACK).\n3. Inspect frame #4 and extract the cleartext username and password.\n4. Formulate the precise evidence citation including timestamp and packet number.\n5. Draft the transport security remediation mandate and submit the evaluation.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Packet Frame Filtering', 'desc' => 'Filter frames by protocol and identify relevant conversation streams.'],
                    ['id' => 2, 'title' => 'TCP Handshake Verification', 'desc' => 'Verify SYN, SYN-ACK, and ACK frame sequence.'],
                    ['id' => 3, 'title' => 'Cleartext Credential Extraction', 'desc' => 'Extract exposed username and password from HTTP POST frame.'],
                    ['id' => 4, 'title' => 'Forensic Evidence Citation', 'desc' => 'Cite frame number, timestamp, and payload string.'],
                    ['id' => 5, 'title' => 'Transport Security Mandate', 'desc' => 'Specify TLS encryption and port 80 redirection policies.'],
                ],
                'rubric' => [
                    ['criterion' => 'Frame filtering', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'filtering'],
                    ['criterion' => 'Protocol sequence reconstruction', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'protocol_sequence'],
                    ['criterion' => 'Exposure identification', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'exposure_identification'],
                    ['criterion' => 'Evidence citation', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'evidence_citation'],
                    ['criterion' => 'Remediation & transport security', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'remediation_and_limits'],
                ],
                'expected_findings' => 'Cleartext username `admin` and password `AdminSecret2026!` transmitted without TLS encryption in packet frame #4.',
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
                'passing_score' => 70,
                'primary_workspace' => 'web_inspector',
                'scenario_background' => 'Perform an audit of the web application server security headers to mitigate clickjacking, MIME sniffing, and cross-site scripting (XSS).',
                'theory_notes' => "• HTTP Security Headers: Server response directives instructing client web browsers on security restrictions.\n• Information Disclosure Banners: Revealing `Server: Apache/2.4.52` or `X-Powered-By: PHP/8.3.0` informs attackers of specific software vulnerabilities.\n• Cookie Security Flags: `HttpOnly` blocks JavaScript cookie access; `Secure` enforces HTTPS transit; `SameSite=Strict/Lax` mitigates CSRF.\n• Defensive Response Headers: `Content-Security-Policy` (mitigates XSS), `X-Frame-Options` (prevents clickjacking), `Strict-Transport-Security` (enforces HTTPS).",
                'vocabulary' => [
                    ['term' => 'HttpOnly', 'definition' => 'Cookie directive preventing client-side scripts from accessing session tokens.'],
                    ['term' => 'Clickjacking', 'definition' => 'Deceptive attack overlaying hidden iframes to trick users into clicking buttons.'],
                    ['term' => 'Content-Security-Policy', 'definition' => 'Defensive header restricting origins from which scripts, styles, and images can load.'],
                    ['term' => 'HSTS', 'definition' => 'Strict-Transport-Security header compelling browsers to use HTTPS exclusively.'],
                ],
                'learning_objectives' => "• Inspect HTTP response headers and detect information disclosure banners\n• Audit session cookie security flags (HttpOnly, Secure, SameSite)\n• Recommend defensive HTTP security headers and compose post-deployment verification tests",
                'instructions' => "1. Audit simulated response headers in the Web Request Inspector.\n2. Flag missing cookie security flags (HttpOnly, Secure, SameSite).\n3. Identify absent security headers (Content-Security-Policy, X-Frame-Options, HSTS).\n4. Formulate the prioritized remediation backlog.\n5. Specify verification commands (`curl -I`) and submit for grading.",
                'tasks' => [
                    ['id' => 1, 'title' => 'HTTP Response Interpretation', 'desc' => 'Extract status code and information disclosure headers.'],
                    ['id' => 2, 'title' => 'Cookie Security Flag Audit', 'desc' => 'Audit HttpOnly, Secure, and SameSite attributes on session cookies.'],
                    ['id' => 3, 'title' => 'Defensive Security Headers Audit', 'desc' => 'Flag missing CSP, X-Frame-Options, and HSTS headers.'],
                    ['id' => 4, 'title' => 'Remediation Prioritisation', 'desc' => 'Prioritize engineering fixes based on exploit severity.'],
                    ['id' => 5, 'title' => 'Verification Test Suite', 'desc' => 'Document curl verification commands to confirm deployed headers.'],
                ],
                'rubric' => [
                    ['criterion' => 'HTTP response interpretation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'request_interpretation'],
                    ['criterion' => 'Cookie security analysis', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'cookie_analysis'],
                    ['criterion' => 'Defensive header analysis', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'header_analysis'],
                    ['criterion' => 'Remediation prioritisation', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'prioritisation'],
                    ['criterion' => 'Verification test commands', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'verification_tests'],
                ],
                'expected_findings' => 'Headers `X-Frame-Options` and `Content-Security-Policy` are completely missing; session cookie lacks HttpOnly and Secure flags.',
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

            // Lab 14: Vulnerability Scoring & Prioritisation
            [
                'module_id' => 4,
                'slug' => 'lab-14-vulnerability-scoring-prioritization',
                'title' => 'Lab 14: Vulnerability Scoring, Asset Context & Prioritisation',
                'category' => 'general',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'passing_score' => 70,
                'primary_workspace' => 'vuln_board',
                'scenario_background' => 'An automated vulnerability assessment across internal and perimeter subnets discovered 10 findings ranging from critical remote code execution to informational banners. Trainees must score, contextualise by asset value and internet exposure, and formulate a defensible remediation schedule.',
                'theory_notes' => "• Vulnerability Management Lifecycle: Discover -> Assess -> Prioritise -> Remediate -> Verify.\n• Common Vulnerability Scoring System (CVSS): Base score metric (0.0 to 10.0) reflecting intrinsic characteristics: Attack Vector (AV), Attack Complexity (AC), Privileges Required (PR), User Interaction (UI), Scope (S), Confidentiality (C), Integrity (I), Availability (A).\n• Contextual Risk Prioritisation: Raw CVSS is insufficient in isolation. Risk = Threat x Vulnerability x Asset Criticality x Exposure. A CVSS 7.5 vulnerability on an internet-facing production database warrants earlier mitigation than a CVSS 9.0 finding on an air-gapped lab workstation.\n• Remediation Categories: Patching (vendor updates), Compensating Controls (WAF/firewall blocks, port filtering), Configuration Hardening (disabling unused services), and Risk Acceptance with documented business justification.",
                'vocabulary' => [
                    ['term' => 'CVSS Base Score', 'definition' => 'Standardized 0.0 - 10.0 rating measuring intrinsic vulnerability severity.'],
                    ['term' => 'Exploitability', 'definition' => 'Ease and technical conditions required for an attacker to execute the vulnerability.'],
                    ['term' => 'Compensating Control', 'definition' => 'Alternative security safeguard implemented to reduce risk when direct patching is delayed.'],
                    ['term' => 'Remediation SLA', 'definition' => 'Service Level Agreement specifying mandatory maximum turnaround times for vulnerability patching.'],
                ],
                'learning_objectives' => "• Validate vulnerability findings using CVE, CVSS base score, and affected software versions\n• Apply contextual risk prioritisation weighing internet exposure and asset criticality\n• Formulate defensible remediation treatment plans (patch, isolate, compensate)\n• Define post-remediation verification steps and draft executive management debriefs",
                'instructions' => "1. Inspect the 10 findings in the Vulnerability Management Board.\n2. Confirm finding validation criteria for critical software (vsftpd backdoor, Apache directory traversal).\n3. Apply contextual risk adjustments prioritizing internet-facing production assets.\n4. Design treatment actions (immediate patching, WAF rules, network segmentation).\n5. Specify verification commands and author the management executive briefing.",
                'tasks' => [
                    ['id' => 1, 'title' => 'Finding Validation', 'desc' => 'Verify CVE identifiers, CVSS base severity, and affected software packages.'],
                    ['id' => 2, 'title' => 'Contextual Prioritisation', 'desc' => 'Prioritize findings factoring asset value, business impact, and internet exposure.'],
                    ['id' => 3, 'title' => 'Remediation Treatment Plan', 'desc' => 'Specify patching schedules, configuration hardening, and compensating controls.'],
                    ['id' => 4, 'title' => 'Verification Procedure', 'desc' => 'Define rescan and testing procedures to confirm vulnerability elimination.'],
                    ['id' => 5, 'title' => 'Executive Debriefing', 'desc' => 'Summarize overall posture, residual risk, and remediation timelines for leadership.'],
                ],
                'rubric' => [
                    ['criterion' => 'Finding validation', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'finding_validation'],
                    ['criterion' => 'Contextual prioritisation', 'max_marks' => 30, 'is_deterministic' => true, 'key' => 'contextual_prioritisation'],
                    ['criterion' => 'Treatment plan', 'max_marks' => 25, 'is_deterministic' => true, 'key' => 'treatment_plan'],
                    ['criterion' => 'Verification steps', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'verification_steps'],
                    ['criterion' => 'Management summary', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'management_summary'],
                ],
                'expected_findings' => 'CVE-2011-2523 (vsftpd Backdoor, CVSS 9.8) on DMZ Gateway requires immediate 24h patching.',
                'remediation_explanation' => 'Prioritize external-facing RCE and directory traversal vulnerabilities immediately before addressing internal medium findings.',
                'questions' => [
                    [
                        'prompt' => 'Which vulnerability requires immediate emergency remediation within 24 hours according to enterprise SLA?',
                        'options' => [
                            ['id' => 'a', 'text' => 'CVE-2011-2523 (vsftpd 2.3.4 Backdoor RCE on DMZ Gateway)', 'is_correct' => true],
                            ['id' => 'b', 'text' => 'CVE-2023-3824 (PHP Buffer Overflow on Internal Dev)', 'is_correct' => false],
                            ['id' => 'c', 'text' => 'CVE-2022-22965 (Spring4Shell on Staging Server)', 'is_correct' => false],
                        ],
                    ],
                ],
            ],

            // Lab 15: SOC Alert Triage & Incident Response
            [
                'module_id' => 4,
                'slug' => 'lab-15-soc-alert-triage-incident-response',
                'title' => 'Lab 15: SOC Alert Triage, Incident Response & Capstone Investigation',
                'category' => 'soc',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 50,
                'passing_score' => 70,
                'primary_workspace' => 'soc_center',
                'scenario_background' => 'The Security Operations Center (SOC) detected high-severity SIEM telemetry on endpoint `WKSTN-FIN-04`. Trainees lead the end-to-end incident response lifecycle following NIST SP 800-61r2: Alert Triage -> Scope & Severity -> Attack Timeline Reconstruction -> Host Isolation & Containment -> Evidence Preservation -> Recovery -> Incident Capstone Report.',
                'theory_notes' => "• NIST Incident Response Lifecycle (SP 800-61r2): 1. Preparation, 2. Detection & Analysis, 3. Containment, Eradication & Recovery, 4. Post-Incident Activity (Lessons Learned).\n• Alert Triage Classification: True Positive (real attack), False Positive (benign alert caused by misconfiguration/rule imperfection), Benign Positive (expected admin/test activity).\n• Containment Tactics: Immediate host network quarantine prevents lateral movement (e.g. Pass-the-Hash / PsExec) while preserving volatile RAM artifacts.\n• Volatile Evidence Preservation: Order of Volatility: CPU registers/cache -> System RAM -> Network state -> Disk storage -> Archival media. Do not power off machine ungracefully.\n• Incident Debriefing & Root Cause Analysis: Establishing initial access vector, dwell time, lateral path, impacted data, and long-term preventative controls.",
                'vocabulary' => [
                    ['term' => 'True Positive', 'definition' => 'A security detection alert that accurately corresponds to genuine adversarial activity.'],
                    ['term' => 'Order of Volatility', 'definition' => 'Preservation hierarchy prioritizing most volatile digital evidence (RAM) over persistent storage.'],
                    ['term' => 'Endpoint Isolation', 'definition' => 'Network containment tactic cutting communications to prevent lateral movement while preserving evidence.'],
                    ['term' => 'NIST SP 800-61r2', 'definition' => 'Computer Security Incident Handling Guide standardizing triage, containment, and response.'],
                ],
                'learning_objectives' => "• Triage SIEM alerts distinguishing True Positives from benign noise\n• Determine scope, affected assets, compromised identities, and severity ratings\n• Reconstruct chronological multi-stage attack timelines\n• Execute coordinated containment (endpoint quarantine, credential revocation, IP blocking)\n• Formulate evidence preservation, eradication, recovery, and executive incident reports",
                'instructions' => "1. Review SIEM alert queue in the SOC Incident Response Center.\n2. Triage alert #SOC-901 and identify the compromised host and user.\n3. Verify the chronological attack stages in the timeline builder.\n4. Execute immediate containment action cards (network isolation, account disablement, IP block).\n5. Document volatile evidence preservation, recovery procedures, and the final incident report.",
                'tasks' => [
                    ['id' => 1, 'title' => 'SIEM Alert Triage', 'desc' => 'Evaluate SIEM alerts and categorize True Positives vs False Positives.'],
                    ['id' => 2, 'title' => 'Scope & Severity Assessment', 'desc' => 'Identify affected host, compromised credentials, and assign incident severity.'],
                    ['id' => 3, 'title' => 'Attack Timeline Reconstruction', 'desc' => 'Reconstruct attack progression from phishing email to credential dumping.'],
                    ['id' => 4, 'title' => 'Containment Execution', 'desc' => 'Execute endpoint isolation, credential invalidation, and boundary firewall blocks.'],
                    ['id' => 5, 'title' => 'Evidence Preservation & Forensics', 'desc' => 'Preserve RAM dumps, audit logs, and establish chain of custody.'],
                    ['id' => 6, 'title' => 'Recovery & System Hardening', 'desc' => 'Clean re-image endpoint, rotate credentials, and verify operational health.'],
                    ['id' => 7, 'title' => 'Capstone Incident Report', 'desc' => 'Compose complete formal executive incident response debriefing report.'],
                ],
                'rubric' => [
                    ['criterion' => 'Alert triage', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'alert_triage'],
                    ['criterion' => 'Scope & severity', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'scope_and_severity'],
                    ['criterion' => 'Attack timeline', 'max_marks' => 20, 'is_deterministic' => true, 'key' => 'incident_timeline'],
                    ['criterion' => 'Containment actions', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'containment_actions'],
                    ['criterion' => 'Evidence preservation', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'evidence_preservation'],
                    ['criterion' => 'Recovery plan', 'max_marks' => 10, 'is_deterministic' => true, 'key' => 'recovery_plan'],
                    ['criterion' => 'Incident report', 'max_marks' => 15, 'is_deterministic' => true, 'key' => 'incident_report'],
                ],
                'expected_findings' => 'Alert #SOC-901 represents a True Positive Mimikatz credential theft incident on WKSTN-FIN-04.',
                'remediation_explanation' => 'Isolate endpoint, revoke corp\\bursar Kerberos tickets and password, block C2 IP 198.51.100.44 at perimeter firewall, and re-image endpoint from known-good baseline.',
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
                        [
                            'id' => 'SOC-902',
                            'severity' => 'High',
                            'title' => 'Outbound Beaconing to Untrusted Autonomous System',
                            'asset' => 'WKSTN-FIN-04 (10.10.10.88)',
                            'user' => 'corp\\bursar',
                            'status' => 'New',
                            'details' => 'Regular HTTPS POST callbacks to 198.51.100.44 at 60s intervals with high entropy payloads.',
                        ],
                        [
                            'id' => 'SOC-903',
                            'severity' => 'Low',
                            'title' => 'Repeated Failed NTLM Auth from Guest Network',
                            'asset' => 'DC01.corp.internal',
                            'user' => 'anonymous',
                            'status' => 'Investigating',
                            'details' => 'Benign printer scan probe across port 445.',
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
