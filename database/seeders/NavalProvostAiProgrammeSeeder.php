<?php

namespace Database\Seeders;

use App\Enums\LabStatus;
use App\Enums\UserRole;
use App\Models\AcademicSession;
use App\Models\Cohort;
use App\Models\Course;
use App\Models\Laboratory;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Programme;
use App\Models\Question;
use App\Models\Scenario;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NavalProvostAiProgrammeSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get or Create Lead Roles
        $coordinator = User::where('email', 'coordinator@gregcyberlab.test')->first() ?? User::firstOrCreate(
            ['email' => 'coordinator@gregcyberlab.test'],
            [
                'name' => 'Dr. Victoria Akpera',
                'password' => Hash::make('Coordinator2026!'),
                'role' => UserRole::ACADEMIC_COORDINATOR,
                'phone' => '+234 803 555 6677',
                'is_active' => true,
            ]
        );

        $instructor = User::where('email', 'instructor@gregcyberlab.test')->first() ?? User::firstOrCreate(
            ['email' => 'instructor@gregcyberlab.test'],
            [
                'name' => 'Commander Terungwa Shior',
                'password' => Hash::make('Instructor2026!'),
                'role' => UserRole::INSTRUCTOR,
                'phone' => '+234 802 111 2233',
                'is_active' => true,
            ]
        );

        $session = AcademicSession::where('is_current', true)->first() ?? AcademicSession::firstOrCreate(
            ['code' => 'AY-2026-27'],
            [
                'name' => '2026/2027 Academic Year (Cohort Alpha & Beta)',
                'start_date' => now()->startOfYear(),
                'end_date' => now()->endOfYear(),
                'is_current' => true,
                'description' => 'Official academic calendar for cybersecurity cohort admissions at Makurdi campus.',
            ]
        );

        // 2. Naval Provost Trainee Personnel
        $trainees = [
            [
                'name' => 'Sub-Lt. Musa Ibrahim',
                'email' => 'provost.ibrahim@gregcyberlab.test',
                'phone' => '+234 803 100 2001',
            ],
            [
                'name' => 'Leading Seaman Cynthia Okon',
                'email' => 'provost.okon@gregcyberlab.test',
                'phone' => '+234 803 100 2002',
            ],
            [
                'name' => 'Master Warrant Officer John Audu',
                'email' => 'provost.audu@gregcyberlab.test',
                'phone' => '+234 803 100 2003',
            ],
            [
                'name' => 'Petty Officer Grace Danjuma',
                'email' => 'provost.danjuma@gregcyberlab.test',
                'phone' => '+234 803 100 2004',
            ],
        ];

        $traineeUsers = [];
        foreach ($trainees as $t) {
            $user = User::updateOrCreate(
                ['email' => $t['email']],
                [
                    'name' => $t['name'],
                    'password' => Hash::make('Provost2026!'),
                    'role' => UserRole::TRAINEE,
                    'phone' => $t['phone'],
                    'is_active' => true,
                ]
            );
            $traineeUsers[] = $user;
        }

        // Also ensure student@gregcyberlab.test is included
        $defaultTrainee = User::where('email', 'student@gregcyberlab.test')->first();
        if ($defaultTrainee) {
            $traineeUsers[] = $defaultTrainee;
        }

        // 3. Establish Academic Programme
        $programmeDescription = 'This course equips Naval Provost personnel with foundational knowledge of cyber warfare, cyber espionage, emerging cyber threats, and their implications for military operations and national national security. It also develops practical skills in applying the CIA Triad—Confidentiality, Integrity, and Availability—alongside information classification, access control, and Operational Security (OPSEC) principles to safeguard sensitive military information and digital systems.';

        $programme = Programme::updateOrCreate(
            ['code' => 'BCAI-SEC-2026'],
            [
                'title' => 'Basic Cybersecurity and Artificial Intelligence for Security Personnel',
                'slug' => 'basic-cybersecurity-and-artificial-intelligence-for-security-personnel',
                'department' => 'Naval Provost & Military Intelligence Operations',
                'duration' => '3 Weeks (Intensive)',
                'delivery_mode' => 'hybrid',
                'coordinator_id' => $coordinator->id,
                'entry_requirements' => 'Naval Provost personnel, military law enforcement officers, or designated defense intelligence operatives with basic digital literacy.',
                'objectives' => 'Equip security personnel with critical capabilities across naval cyber warfare defense, espionage identification, CIA Triad tactical implementation, classified information governance, multi-level access control, OPSEC mitigation, and AI threat triage.',
                'description' => $programmeDescription,
                'status' => 'active',
                'is_active' => true,
            ]
        );

        // Relate trainees and users directly to this Programme (programme_user pivot)
        $enrolledPayload = [];
        foreach ($traineeUsers as $u) {
            $enrolledPayload[$u->id] = [
                'enrolled_at' => now(),
                'status' => 'active',
                'notes' => 'Direct assignment to Naval Provost Security Personnel cohort.',
            ];
        }
        $programme->users()->syncWithoutDetaching($enrolledPayload);

        // Also attach $defaultTrainee to Diploma programme if it exists
        $diplomaProg = Programme::where('code', 'DCD-2026')->first();
        if ($diplomaProg && $defaultTrainee) {
            $diplomaProg->users()->syncWithoutDetaching([
                $defaultTrainee->id => [
                    'enrolled_at' => now(),
                    'status' => 'active',
                    'notes' => 'Enrolled in foundational SOC Operations diploma.',
                ],
            ]);
        }

        // 4. Establish Course Under Programme
        $course = Course::updateOrCreate(
            ['slug' => 'basic-cybersecurity-ai-security-personnel'],
            [
                'programme_id' => $programme->id,
                'title' => 'Basic Cybersecurity and Artificial Intelligence for Security Personnel',
                'code' => 'NAV-AI-101',
                'summary' => 'Tactical cybersecurity foundations, CIA Triad operationalization, OPSEC, and artificial intelligence threat defense for naval provost operatives.',
                'description' => $programmeDescription,
                'level' => 'beginner_to_intermediate',
                'credit_hours' => 4,
                'estimated_duration_hours' => 45,
                'passing_score' => 70,
                'status' => 'published',
                'created_by' => $instructor->id,
                'approved_by' => $coordinator->id,
                'published_at' => now(),
                'is_published' => true,
            ]
        );

        $course->instructors()->syncWithoutDetaching([
            $instructor->id => ['is_primary' => true, 'assigned_at' => now()],
        ]);

        // 5. Cohort Establishment
        $cohort = Cohort::updateOrCreate(
            ['code' => 'NAV-2026-BRAVO'],
            [
                'course_id' => $course->id,
                'programme_id' => $programme->id,
                'academic_session_id' => $session->id,
                'name' => 'Naval Provost Security Cadets - Batch Bravo 2026',
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->addMonths(2)->endOfMonth(),
                'max_capacity' => 35,
                'status' => 'active',
                'is_active' => true,
            ]
        );

        $cohort->instructors()->syncWithoutDetaching([
            $instructor->id => ['is_primary' => true, 'assigned_at' => now()],
        ]);

        foreach ($traineeUsers as $u) {
            $cohort->users()->syncWithoutDetaching([
                $u->id => ['enrolled_at' => now(), 'status' => 'active'],
            ]);
        }

        // 6. Curriculum Modules
        $mod1 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'naval-mod-1-cyber-warfare-espionage'],
            ['title' => 'Module 1: Cyber Warfare, Cyber Espionage & Military Threats', 'order' => 1]
        );

        $mod2 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'naval-mod-2-cia-triad-classification'],
            ['title' => 'Module 2: The CIA Triad & Military Information Classification', 'order' => 2]
        );

        $mod3 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'naval-mod-3-access-control-opsec'],
            ['title' => 'Module 3: Multi-Level Access Control & Operational Security (OPSEC)', 'order' => 3]
        );

        $mod4 = Module::updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'naval-mod-4-ai-threats-automated-triage'],
            ['title' => 'Module 4: Artificial Intelligence Threats & Automated Triage', 'order' => 4]
        );

        // 7. Seed 12 Specialized Tactical Laboratories
        $labs = $this->getNavalLabsData();

        foreach ($labs as $index => $item) {
            $moduleId = match ($item['module_number']) {
                1 => $mod1->id,
                2 => $mod2->id,
                3 => $mod3->id,
                default => $mod4->id,
            };

            $lesson = Lesson::updateOrCreate(
                ['module_id' => $moduleId, 'slug' => 'naval-lesson-'.($index + 1)],
                [
                    'title' => 'Naval Provost Lesson '.($index + 1).': '.$item['title'],
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
                    'version' => '1.0.0',
                    'scenario_background' => $item['scenario_background'],
                    'theory_notes' => $item['theory_notes'] ?? null,
                    'vocabulary' => $item['vocabulary'] ?? [],
                    'learning_objectives' => $item['learning_objectives'],
                    'safety_notice' => 'SAFETY NOTICE: This simulation executes entirely in an educational software sandbox. No actual military network or external operational systems are contacted.',
                    'safety_scope' => ['environment' => 'isolated_simulation', 'target_range' => 'naval_provost_sandbox'],
                    'instructions' => $item['instructions'],
                    'tasks' => $item['tasks'] ?? [],
                    'evidence_requirements' => $item['evidence_requirements'] ?? [],
                    'readiness_questions' => $item['readiness_questions'] ?? [],
                    'expected_findings' => $item['expected_findings'],
                    'rubric' => $item['rubric'] ?? [],
                    'debrief_content' => $item['debrief_content'] ?? null,
                    'prerequisites' => $item['prerequisites'] ?? [],
                    'remediation_explanation' => $item['remediation_explanation'],
                    'instructor_guide' => $item['instructor_guide'] ?? 'Verify provost investigative rigor, chain of custody compliance, and sound evidence handling.',
                    'workbench_config' => $item['workbench_config'] ?? [],
                ]
            );

            // Configure Scenario & Terminal Allowed Commands
            Scenario::updateOrCreate(
                ['laboratory_id' => $lab->id],
                [
                    'title' => $lab->title.' Simulation Scenario',
                    'initial_state' => ['status' => 'initialized', 'tactical_mode' => 'active'],
                    'network_topology' => [
                        'lan' => '10.20.0.0/24',
                        'gateway' => '10.20.0.1 (Tactical C2 Router)',
                        'provost_terminal' => '10.20.0.45',
                        'weapons_repo' => '10.20.0.99',
                    ],
                    'allowed_commands' => $item['allowed_commands'] ?? ['ls', 'cat', 'grep', 'sha256sum', 'ip'],
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
                        'correct_answer_explanation' => $qData['correct_answer_explanation'] ?? 'Review military operational guidelines to confirm.',
                    ]
                );
            }
        }
    }

    protected function getNavalLabsData(): array
    {
        return [
            // Lab 1
            [
                'module_number' => 1,
                'slug' => 'naval-cyber-warfare-threat-surface-assessment',
                'title' => 'NP-LAB 01: Cyber Warfare & Maritime Operational Threat Surface Assessment',
                'category' => 'tactical_cyber',
                'difficulty' => 'beginner',
                'estimated_minutes' => 45,
                'passing_score' => 70,
                'primary_workspace' => 'kali_terminal',
                'scenario_background' => 'A foreign state-sponsored adversary has begun reconnaissance against naval maritime logistics networks and port operations in the Gulf of Guinea. As a Naval Provost security officer, your duty is to inspect the shore-to-ship tactical relay interface for exposed attack surfaces, unauthorized listening daemons, and unhardened ports.',
                'theory_notes' => 'Cyber warfare represents deliberate actions in cyberspace to disrupt, deny, degrade, or destroy adversary information systems and national infrastructure. Tactical threat surface minimization is the first line of defense.',
                'vocabulary' => [
                    ['term' => 'Cyber Warfare', 'definition' => 'State-sponsored hostile cyberspace operations targeting military and strategic assets.'],
                    ['term' => 'Attack Surface', 'definition' => 'The total sum of vulnerabilities and access paths accessible to an unauthorized adversary.'],
                    ['term' => 'Tactical C2', 'definition' => 'Command and Control infrastructure used to direct military maritime operations.'],
                ],
                'learning_objectives' => 'Identify military attack surface vectors; use terminal commands to audit open listening ports; document potential exposure vectors in maritime C2 systems.',
                'instructions' => 'Execute network discovery commands in your terminal emulator. Inspect local listening interfaces with ip and nmap. Identify any unapproved services running on port 23 (Telnet) or port 21 (FTP) that violate military operational security directives.',
                'tasks' => [
                    'Review network interface settings using "ip a".',
                    'Scan the tactical gateway 10.20.0.1 using "nmap -sV 10.20.0.1".',
                    'Check active listening sockets to ensure no unencrypted legacy protocols are running.',
                    'Document unhardened services for immediate provost notification.',
                ],
                'evidence_requirements' => ['Gateway port scan report', 'List of unencrypted services detected', 'Written mitigation recommendation'],
                'expected_findings' => 'Telnet (port 23) was found enabled on the legacy perimeter relay, transmitting authentication credentials in cleartext.',
                'remediation_explanation' => 'Immediately disable legacy Telnet and FTP daemons. Enforce SSHv2 with hardware-backed military cryptographic keypairs and restrict access via firewall rules.',
                'allowed_commands' => ['ip', 'nmap', 'cat', 'grep', 'ls', 'pwd', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'Which protocol was discovered running on the tactical gateway that violates OPSEC due to cleartext transmission?',
                        'options' => [
                            ['label' => 'Telnet (Port 23)', 'is_correct' => true],
                            ['label' => 'SSH (Port 22)', 'is_correct' => false],
                            ['label' => 'HTTPS (Port 443)', 'is_correct' => false],
                            ['label' => 'DNSSEC (Port 53)', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Telnet transmits all communications including passwords in cleartext without encryption, making it an unacceptable risk in military environments.',
                    ],
                    [
                        'prompt' => 'In military cyber warfare doctrines, what does "Threat Surface Reduction" accomplish?',
                        'options' => [
                            ['label' => 'Minimizes the potential entry points available to adversary reconnaissance and exploitation', 'is_correct' => true],
                            ['label' => 'Completely replaces all physical security perimeter sentries', 'is_correct' => false],
                            ['label' => 'Disables all tactical radio equipment permanently', 'is_correct' => false],
                            ['label' => 'Eliminates the requirement for user passwords', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Reducing the attack surface limits unnecessary open ports, unused protocols, and unneeded software services that adversaries can target.',
                    ],
                ],
            ],

            // Lab 2
            [
                'module_number' => 1,
                'slug' => 'naval-cyber-espionage-covert-exfiltration-triage',
                'title' => 'NP-LAB 02: Countering Cyber Espionage & Covert Network Exfiltration',
                'category' => 'threat_intelligence',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'passing_score' => 70,
                'primary_workspace' => 'general_workbench',
                'scenario_background' => 'Naval intelligence alerts indicate that an Advanced Persistent Threat (APT) group is attempting to steal sensitive patrol schedules of naval missile craft. Telemetry shows unusual periodic outbound DNS requests to an unclassified domain outside Nigerian naval jurisdiction. Provost investigators must dissect the communication logs to locate the compromised host.',
                'theory_notes' => 'Cyber espionage involves clandestine digital intelligence gathering by state or non-state actors. Covert data exfiltration often relies on DNS tunneling, steganography, or slow beaconing to evade traditional firewalls.',
                'vocabulary' => [
                    ['term' => 'Cyber Espionage', 'definition' => 'Covert operation to steal classified data or trade secrets for strategic military advantage.'],
                    ['term' => 'DNS Tunneling', 'definition' => 'Encapsulating unauthorized data inside standard DNS query packets to bypass perimeter filters.'],
                    ['term' => 'C2 Beaconing', 'definition' => 'Regular communication signals sent by malware to its command-and-control server.'],
                ],
                'learning_objectives' => 'Recognize patterns of covert data exfiltration; detect anomalous outbound DNS beaconing; isolate compromised military assets.',
                'instructions' => 'Analyze the DNS query log and flow telemetry provided on your workbench. Look for high-frequency subdomain requests (e.g., base64-encoded strings appended to foreign top-level domains). Identify the originating IP address and quarantine the host.',
                'tasks' => [
                    'Inspect the provost security event log.',
                    'Filter query entries to identify entropy anomalies in requested domain names.',
                    'Correlate the outbound IP with internal naval berth workstation assignments.',
                    'Flag the threat actor tactic as DNS tunneling exfiltration.',
                ],
                'evidence_requirements' => ['Extracted malicious subdomain payload', 'Source MAC and IP of compromised workstation', 'Incident report'],
                'expected_findings' => 'Workstation at 10.20.0.45 was transmitting base64-encoded tactical dispatches disguised inside DNS TXT and A record queries to an adversary server.',
                'remediation_explanation' => 'Isolate host 10.20.0.45 from the tactical VLAN. Block unauthorized external DNS resolvers at the perimeter firewall and enforce DNS RPZ (Response Policy Zones).',
                'allowed_commands' => ['cat', 'grep', 'ss', 'find', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'Why do hostile cyber espionage groups frequently utilize DNS tunneling for exfiltration?',
                        'options' => [
                            ['label' => 'Outbound DNS traffic is frequently permitted through perimeter firewalls without deep inspection', 'is_correct' => true],
                            ['label' => 'DNS is the only protocol capable of transmitting military text files', 'is_correct' => false],
                            ['label' => 'It automatically destroys the host hardware upon completion', 'is_correct' => false],
                            ['label' => 'It bypasses the need for an internet service provider', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Firewalls routinely allow port 53 UDP traffic out to permit domain resolution, which threat actors exploit if recursive query inspection is absent.',
                    ],
                    [
                        'prompt' => 'What is the immediate priority action for a Naval Provost officer upon confirming an active covert exfiltration beacon?',
                        'options' => [
                            ['label' => 'Physically or logically isolate the affected endpoint from the military network to stop data leakage', 'is_correct' => true],
                            ['label' => 'Reboot the central server without preserving any volatile logs', 'is_correct' => false],
                            ['label' => 'Send an email to the adversary requesting them to stop', 'is_correct' => false],
                            ['label' => 'Delete all network logs immediately', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Containment by isolating the compromised system halts classified leakage while preserving forensic artifacts for subsequent investigation.',
                    ],
                ],
            ],

            // Lab 3
            [
                'module_number' => 2,
                'slug' => 'cia-triad-tactical-maritime-communications',
                'title' => 'NP-LAB 03: Applying the CIA Triad in Tactical Maritime Communications',
                'category' => 'defense_foundations',
                'difficulty' => 'beginner',
                'estimated_minutes' => 40,
                'passing_score' => 70,
                'primary_workspace' => 'kali_terminal',
                'scenario_background' => 'A naval task force transmitting critical patrol waypoints between Naval Headquarters and patrol boats at sea requires strict CIA Triad validation. You must audit three components: Confidentiality (ensuring secret orders cannot be intercepted by unauthenticated ships), Integrity (verifying patrol waypoints have not been altered in transit), and Availability (verifying tactical link redundancy).',
                'theory_notes' => 'The CIA Triad forms the bedrock of defensive cybersecurity. In military maritime operations, a failure in Confidentiality compromises operational surprise; a failure in Integrity could mislead vessels into ambushes; a failure in Availability prevents rapid tactical response.',
                'vocabulary' => [
                    ['term' => 'Confidentiality', 'definition' => 'Assurance that information is accessible only to authorized personnel.'],
                    ['term' => 'Integrity', 'definition' => 'Assurance that data has not been modified, corrupted, or forged in transit or storage.'],
                    ['term' => 'Availability', 'definition' => 'Assurance that authorized users have timely and reliable access to systems and information.'],
                ],
                'learning_objectives' => 'Demonstrate practical application of Confidentiality, Integrity, and Availability; calculate cryptographic hashes to detect coordinate alterations; verify communication channel health.',
                'instructions' => 'In your simulated terminal, inspect the received maritime dispatch files in `/var/tactical_orders/`. Calculate the SHA-256 hash using `sha256sum` and compare it against the authorized hash transmitted via out-of-band naval authentication keys.',
                'tasks' => [
                    'Navigate to /var/tactical_orders and list available dispatch files.',
                    'Calculate the hash of orders_bravo.txt using "sha256sum orders_bravo.txt".',
                    'Compare the result with the expected naval command checksum: 8f42d17c80...e1.',
                    'Identify which leg of the CIA Triad was breached if coordinates differ from the master dispatch.',
                ],
                'evidence_requirements' => ['SHA256 checksum terminal output', 'CIA Triad classification worksheet'],
                'expected_findings' => 'The file orders_bravo.txt had been tampered with: the patrol rendezvous coordinates were modified by 3 nautical miles, changing the SHA-256 hash completely.',
                'remediation_explanation' => 'Enforce cryptographically signed dispatches (PGP/GPG or military PKI) with mandatory integrity checksum verification before acting on tactical navigation orders.',
                'allowed_commands' => ['sha256sum', 'cat', 'ls', 'pwd', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'If an adversary intercepts and secretly alters maritime patrol coordinates in an order file, which leg of the CIA Triad is directly violated?',
                        'options' => [
                            ['label' => 'Integrity', 'is_correct' => true],
                            ['label' => 'Availability', 'is_correct' => false],
                            ['label' => 'Accounting', 'is_correct' => false],
                            ['label' => 'Non-repudiation', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Integrity guarantees that information remains exact, authentic, and unaltered from its original form.',
                    ],
                    [
                        'prompt' => 'Which cryptographic tool did you employ in the terminal to mathematically prove whether a military dispatch file had been tampered with?',
                        'options' => [
                            ['label' => 'sha256sum', 'is_correct' => true],
                            ['label' => 'ip route', 'is_correct' => false],
                            ['label' => 'whois', 'is_correct' => false],
                            ['label' => 'telnet', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'sha256sum computes a 256-bit cryptographic digest. Any alteration of even a single byte in the input yields an entirely different hash value.',
                    ],
                ],
            ],

            // Lab 4
            [
                'module_number' => 2,
                'slug' => 'military-information-classification-spillage-containment',
                'title' => 'NP-LAB 04: Military Information Classification & Classified Spillage Containment',
                'category' => 'security_policy',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 35,
                'passing_score' => 70,
                'primary_workspace' => 'general_workbench',
                'scenario_background' => 'A classified incident has been reported at the Naval Dockyard provost office: a document marked TOP SECRET // NOFORN (containing naval radar frequencies) was inadvertently saved into an unclassified shared folder accessible to civil contractors. As the provost investigator, you must execute immediate spillage containment and classify information appropriately.',
                'theory_notes' => 'Classified spillage occurs when sensitive information is placed on an information system not approved for that classification level. Immediate containment, sanitization, and damage assessment are statutory military requirements.',
                'vocabulary' => [
                    ['term' => 'Information Classification', 'definition' => 'Categorizing information based on the sensitivity and damage that unauthorized disclosure would cause.'],
                    ['term' => 'Classified Spillage', 'definition' => 'Transfer of classified or sensitive information to an unaccredited system or unauthorized media.'],
                    ['term' => 'Need-to-Know', 'definition' => 'Security principle restricting access to information only to personnel who require it for operational duties.'],
                ],
                'learning_objectives' => 'Apply national security information classification tiers (RESTRICTED, CONFIDENTIAL, SECRET, TOP SECRET); execute immediate spillage containment protocol; conduct access audit.',
                'instructions' => 'Review the document headers and classification markers on your workbench. Determine the security classification tier of the compromised file. Formulate the containment plan to isolate the shared folder and audit all personnel who accessed the file prior to quarantine.',
                'tasks' => [
                    'Review classification banners on documents in the shared directory.',
                    'Identify the file containing the TOP SECRET maritime radar frequency schema.',
                    'Record the names and credentials of all users who read or downloaded the document.',
                    'Initiate provost digital quarantine protocol.',
                ],
                'evidence_requirements' => ['Audit trail of unauthorized access', 'Damage assessment classification matrix', 'Sanitization certificate'],
                'expected_findings' => 'Document "radar_frequencies_v3.pdf" marked TOP SECRET was accessed by 3 contractor accounts on the unclassified dockyard network.',
                'remediation_explanation' => 'Isolate unaccredited storage media; conduct certified sanitization (NIST SP 800-88); revoke contractor shared drive access; conduct mandatory security debriefs with provost personnel.',
                'allowed_commands' => ['cat', 'grep', 'find', 'file', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'Which classification tier is reserved for information whose unauthorized disclosure could cause exceptionally grave damage to national security?',
                        'options' => [
                            ['label' => 'TOP SECRET', 'is_correct' => true],
                            ['label' => 'RESTRICTED', 'is_correct' => false],
                            ['label' => 'CONFIDENTIAL', 'is_correct' => false],
                            ['label' => 'OFFICIAL SENSITIVE', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'TOP SECRET is the highest standard tier, defined specifically by the standard of "exceptionally grave damage" to national security.',
                    ],
                    [
                        'prompt' => 'What is the correct provost protocol when a classified spillage occurs onto an unclassified workstation?',
                        'options' => [
                            ['label' => 'Immediately isolate the workstation from the network, prevent user deletion, and notify the Provost Marshal / Information Security Officer', 'is_correct' => true],
                            ['label' => 'Forward the document to personal email addresses as a backup', 'is_correct' => false],
                            ['label' => 'Empty the recycle bin and pretend the spillage never happened', 'is_correct' => false],
                            ['label' => 'Print 50 copies for distributed review', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Proper spillage containment requires immediate isolation to prevent further dissemination, followed by authorized forensics and certified sanitization.',
                    ],
                ],
            ],

            // Lab 5
            [
                'module_number' => 3,
                'slug' => 'role-based-access-control-naval-provost-hardening',
                'title' => 'NP-LAB 05: Multi-Level Access Control & Naval Provost Permission Hardening',
                'category' => 'access_control',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'passing_score' => 70,
                'primary_workspace' => 'kali_terminal',
                'scenario_background' => 'During an internal provost security inspection of the Naval Armory and Provost Custody management server, investigators discover that file permissions on the detention logs and arms inventory databases are world-readable (chmod 777). You must audit permissions, assign correct ownership, and enforce the Principle of Least Privilege.',
                'theory_notes' => 'Role-Based Access Control (RBAC) and Discretionary Access Control (DAC) permissions restrict system access based on an authenticated user role and organizational Need-to-Know. Overly permissive file rights allow insider threats and lateral exploitation.',
                'vocabulary' => [
                    ['term' => 'Least Privilege', 'definition' => 'Granting users only the minimum permissions necessary to perform their legitimate job responsibilities.'],
                    ['term' => 'RBAC', 'definition' => 'Role-Based Access Control: restricting access based on assigned organizational roles.'],
                    ['term' => 'World-Readable (chmod 777)', 'definition' => 'A dangerous permission state granting full read, write, and execute privileges to all system users.'],
                ],
                'learning_objectives' => 'Audit POSIX file permissions in a Linux system; identify dangerous 777 permissions on sensitive files; apply hardened ownership and restricted permissions using chmod and chown.',
                'instructions' => 'Navigate to `/srv/provost_armory/`. Use `ls -la` to inspect the permissions on `arms_inventory.db` and `custody_register.txt`. Use `chmod` and `chown` to restrict access strictly to root and the provost_officers group.',
                'tasks' => [
                    'List directory permissions using "ls -la /srv/provost_armory".',
                    'Identify files possessing 777 or world-writable bits.',
                    'Change permission of arms_inventory.db to 640 (Owner: read/write, Group: read, Others: none).',
                    'Verify the updated permission matrix using "ls -l".',
                ],
                'evidence_requirements' => ['Before and after ls -la permission listings', 'Verified least-privilege matrix'],
                'expected_findings' => 'Arms inventory and detainee registers were world-writable, allowing any low-privilege user to falsify munitions counts or detention records.',
                'remediation_explanation' => 'Apply `chmod 640` and `chown root:provost_officers`. Enforce umask 027 across all provost management servers to prevent default world-readable creations.',
                'allowed_commands' => ['ls', 'chmod', 'chown', 'cat', 'pwd', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'Which octal permission code grants read/write to the owner, read-only to the group, and zero access to all others (ideal for sensitive provost registries)?',
                        'options' => [
                            ['label' => '640', 'is_correct' => true],
                            ['label' => '777', 'is_correct' => false],
                            ['label' => '755', 'is_correct' => false],
                            ['label' => '666', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => '640 corresponds to rw-r-----, ensuring unauthorized system users cannot view or tamper with sensitive records.',
                    ],
                    [
                        'prompt' => 'What core cybersecurity principle mandates that a security sentry should only have access to information essential for their specific shift duties?',
                        'options' => [
                            ['label' => 'Principle of Least Privilege', 'is_correct' => true],
                            ['label' => 'Security through Obscurity', 'is_correct' => false],
                            ['label' => 'Defense in Inaction', 'is_correct' => false],
                            ['label' => 'Total Access Privilege', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'The Principle of Least Privilege dictates that individuals should be granted only the access required to complete their designated tasks, minimizing blast radius.',
                    ],
                ],
            ],

            // Lab 6
            [
                'module_number' => 3,
                'slug' => 'naval-opsec-digital-footprint-counter-recon',
                'title' => 'NP-LAB 06: Tactical Operational Security (OPSEC) & Counter-Reconnaissance',
                'category' => 'opsec',
                'difficulty' => 'beginner',
                'estimated_minutes' => 40,
                'passing_score' => 70,
                'primary_workspace' => 'general_workbench',
                'scenario_background' => 'Adversary intelligence agents are monitoring open-source intelligence (OSINT), social media platforms, and personnel digital footprints to identify naval officers assigned to classified anti-piracy deployments. A photograph posted by a rating contains embedded EXIF GPS coordinates revealing the secret departure dock and vessel names.',
                'theory_notes' => 'Operational Security (OPSEC) is the systematic process of identifying unclassified critical information that an adversary could piece together to deduce military plans and capabilities. Digital footprints and metadata are prime OSINT hunting grounds.',
                'vocabulary' => [
                    ['term' => 'OPSEC', 'definition' => 'Operational Security: denying critical indicators and sensitive details to hostile observers.'],
                    ['term' => 'OSINT', 'definition' => 'Open Source Intelligence: gathering intelligence from publicly available online sources.'],
                    ['term' => 'EXIF Metadata', 'definition' => 'Exchangeable Image File Format data embedded in photos, including GPS location and camera model.'],
                ],
                'learning_objectives' => 'Analyze digital footprint indicators; extract and scrub EXIF metadata containing geographic coordinates; implement counter-reconnaissance guidelines for naval units.',
                'instructions' => 'Inspect the image files and social media dispatches on your provost workbench. Identify the embedded metadata that leaks latitude and longitude coordinates of the naval jetty. Prepare an OPSEC advisory bulletin for the command.',
                'tasks' => [
                    'Examine the metadata of "dock_patrol_photo.jpg".',
                    'Identify GPS latitude and longitude tags embedded by the mobile phone camera.',
                    'Map the coordinates to establish that the exact berthing location of the missile boat was exposed.',
                    'Draft an OPSEC countermeasure directive requiring metadata scrubbing and geo-tagging deactivation.',
                ],
                'evidence_requirements' => ['Extracted EXIF coordinate report', 'OPSEC counter-recon directive for naval base personnel'],
                'expected_findings' => 'The photograph contained EXIF tags: GPSLatitude: 4° 47\' 22.8" N, GPSLongitude: 7° 0\' 34.2" E, accurately pinning the secure naval jetty berth.',
                'remediation_explanation' => 'Mandate automatic EXIF metadata stripping on all departmental mobile gateways. Enforce strict base orders prohibiting personal smartphones in operational berths.',
                'allowed_commands' => ['cat', 'grep', 'file', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'What critical piece of embedded information in unscrubbed smartphone photographs poses a catastrophic OPSEC hazard to naval deployments?',
                        'options' => [
                            ['label' => 'EXIF GPS coordinates pinpointing the exact physical location where the image was captured', 'is_correct' => true],
                            ['label' => 'The color saturation value of the water', 'is_correct' => false],
                            ['label' => 'The image file size in kilobytes', 'is_correct' => false],
                            ['label' => 'The screen brightness setting of the viewer', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'EXIF GPS metadata records precise satellite coordinates, allowing hostile foreign analysts to locate military vessels and assembly points with high precision.',
                    ],
                    [
                        'prompt' => 'What is the primary goal of Operational Security (OPSEC) in military and provost operations?',
                        'options' => [
                            ['label' => 'Denying adversaries access to critical indicators that would allow them to deduce classified military plans', 'is_correct' => true],
                            ['label' => 'Stopping all communications within the military entirely', 'is_correct' => false],
                            ['label' => 'Increasing the number of public press conferences during active combat', 'is_correct' => false],
                            ['label' => 'Encrypting only public advertising materials', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'OPSEC focuses on identifying and protecting indicators that seem innocent on their own but together reveal critical operations.',
                    ],
                ],
            ],

            // Lab 7
            [
                'module_number' => 4,
                'slug' => 'ai-threats-deepfake-disinformation-triage',
                'title' => 'NP-LAB 07: Artificial Intelligence Threats: Deepfakes & Algorithmic Disinformation',
                'category' => 'ai_security',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'passing_score' => 70,
                'primary_workspace' => 'general_workbench',
                'scenario_background' => 'The Naval Provost Watch Officer receives an urgent audio dispatch over an auxiliary voice channel purportedly from the Flag Officer Commanding (FOC), ordering an immediate release of detained foreign trawlers without court clearance. Acoustic and spectral analysis suggests this is an AI-generated synthetic voice clone (deepfake vishing). Provost personnel must verify authenticity.',
                'theory_notes' => 'Generative Artificial Intelligence allows threat actors to synthesize hyper-realistic voice and video deepfakes with few-shot training samples. In military contexts, AI impersonation can be weaponized to compromise chain-of-command dispatches.',
                'vocabulary' => [
                    ['term' => 'Deepfake', 'definition' => 'Synthetic media generated by artificial neural networks to convincingly impersonate a person.'],
                    ['term' => 'Voice Cloning (Vishing)', 'definition' => 'AI audio synthesis replicating vocal timbre, cadence, and accent to conduct social engineering.'],
                    ['term' => 'Out-of-Band Verification', 'definition' => 'Confirming the validity of an order through an independent, pre-established secondary communication channel.'],
                ],
                'learning_objectives' => 'Recognize indicators of synthetic AI voice and video generation; identify spectral and phonetic anomalies; enforce strict military out-of-band challenge-response protocols.',
                'instructions' => 'Examine the audio waveform and spectral frequency report on your workbench. Compare the synthetic sample against authenticated baseline voiceprints of the commanding officer. Execute out-of-band verification protocol via naval tactical crypto phone.',
                'tasks' => [
                    'Analyze the audio spectrogram for robotic micro-pauses and unnatural harmonic cutoffs.',
                    'Review authentication token header in the transmission packet.',
                    'Check for absence of cryptographic provost dispatch digital signatures.',
                    'Execute out-of-band challenge verification to prove the dispatch was an AI spoof.',
                ],
                'evidence_requirements' => ['Acoustic anomaly inspection report', 'Cryptographic challenge-response log', 'Provost alert bulletin'],
                'expected_findings' => 'The dispatch audio exhibited synthetic neural generation artifacts (lack of ambient naval bridge acoustic resonance and synthetic pitch jitter), confirming a malicious AI deepfake.',
                'remediation_explanation' => 'Never execute high-impact commands based solely on voice or unverified video. Enforce multi-party digital signatures and challenge-response authentication codes.',
                'allowed_commands' => ['cat', 'grep', 'sha256sum', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'When a Naval Provost watch officer receives an unexpected, urgent verbal order over the telephone that deviates from standard operational protocol, what is the required defense procedure?',
                        'options' => [
                            ['label' => 'Perform out-of-band verification using authenticated cryptographic challenge codes or an independent secure channel', 'is_correct' => true],
                            ['label' => 'Execute the order immediately without asking any questions', 'is_correct' => false],
                            ['label' => 'Post the recording onto social media to ask the public for opinions', 'is_correct' => false],
                            ['label' => 'Assume it is genuine because the voice sounds familiar', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Because AI voice cloning can replicate human tone flawlessly, out-of-band verification via authenticated protocols is vital.',
                    ],
                    [
                        'prompt' => 'Which acoustic anomaly is commonly observed in real-time generative AI voice synthesis?',
                        'options' => [
                            ['label' => 'Unnatural cadence, lack of realistic ambient background resonance, and spectral phase cutoffs', 'is_correct' => true],
                            ['label' => 'Perfect analog cassette tape hiss', 'is_correct' => false],
                            ['label' => 'Loud military Morse code beeping', 'is_correct' => false],
                            ['label' => 'Excessive battery power consumption on the telephone speaker', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Synthetic voices frequently struggle with natural breathing cadences, room acoustics, and harmonic transitions between syllables.',
                    ],
                ],
            ],

            // Lab 8
            [
                'module_number' => 4,
                'slug' => 'ai-automated-telemetry-provost-incident-response',
                'title' => 'NP-LAB 08: AI-Assisted Threat Telemetry & Provost Incident Response',
                'category' => 'ai_security',
                'difficulty' => 'advanced',
                'estimated_minutes' => 50,
                'passing_score' => 70,
                'primary_workspace' => 'kali_terminal',
                'scenario_background' => 'The naval base automated perimeter server experiences a high-velocity credential attack against the Provost Access Registry. An AI-assisted anomaly detection engine has flagged anomalous authentication traffic spanning 15,000 requests per minute from external subnets. As the lead provost cyber investigator, you must interpret the AI telemetry alerts, isolate the hostile IP, and preserve digital evidence under chain of custody.',
                'theory_notes' => 'Modern Security Operations Centers leverage Artificial Intelligence and Machine Learning models to correlate millions of log entries in real-time, detecting distributed brute-force attacks and zero-day anomalies faster than human analysts.',
                'vocabulary' => [
                    ['term' => 'AI Anomaly Detection', 'definition' => 'Using machine learning to baseline normal network behavior and automatically alert on statistical outliers.'],
                    ['term' => 'Chain of Custody', 'definition' => 'Documented chronological trail showing the custody, control, transfer, and analysis of digital evidence.'],
                    ['term' => 'Credential Stuffing', 'definition' => 'Automated injection of stolen username/password pairs to gain unauthorized access to accounts.'],
                ],
                'learning_objectives' => 'Interpret AI threat score alerts; filter security access logs in the terminal using grep and awk; isolate offending IPs; formulate evidentiary chain-of-custody documentation.',
                'instructions' => 'In your terminal, inspect the security telemetry log in `/var/log/provost_ai_alerts.log`. Extract the offending source IP address identified by the highest AI threat confidence score (>90%). Formulate the defensive firewall rule and calculate SHA-256 evidence integrity hashes.',
                'tasks' => [
                    'Review the AI alerts log using "cat /var/log/provost_ai_alerts.log".',
                    'Filter for alerts with threat_score >= 95 using grep.',
                    'Identify the attacking IP: 198.51.100.77 generating credential stuffing against provost portals.',
                    'Compute the evidence hash of the log file using "sha256sum" to ensure chain of custody for court-martial proceedings.',
                ],
                'evidence_requirements' => ['Top hostile IP extracted from AI telemetry', 'Cryptographic log file hash for court-martial evidence', 'Incident triage log'],
                'expected_findings' => 'Hostile external IP 198.51.100.77 executed 14,200 credential stuffing attempts in 90 seconds. AI model flagged it with 99.4% confidence score.',
                'remediation_explanation' => 'Block IP 198.51.100.77 immediately at the border router; enforce adaptive rate-limiting and mandatory multi-factor authentication (MFA) on all provost portals.',
                'allowed_commands' => ['cat', 'grep', 'awk', 'sha256sum', 'ls', 'pwd', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'Why is calculating a SHA-256 cryptographic hash of digital log files immediately upon incident triage mandatory for military provost personnel?',
                        'options' => [
                            ['label' => 'To establish a legally admissible chain of custody proving the log evidence was not altered prior to military judicial proceedings', 'is_correct' => true],
                            ['label' => 'To automatically delete the log files from the server hard drive', 'is_correct' => false],
                            ['label' => 'To increase the download speed of the evidence files', 'is_correct' => false],
                            ['label' => 'To translate the logs from English into binary code', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'In military court-martial proceedings, cryptographic hashes demonstrate that digital evidence remained pristine and untampered from the time of seizure.',
                    ],
                    [
                        'prompt' => 'What primary operational advantage does an AI anomaly detection engine provide to naval security watchstanders during a brute-force cyber assault?',
                        'options' => [
                            ['label' => 'Real-time correlation of high-volume telemetry to surface high-confidence threat signals above background noise', 'is_correct' => true],
                            ['label' => 'It completely eliminates the need for any human command oversight', 'is_correct' => false],
                            ['label' => 'It allows the server to run without electrical power', 'is_correct' => false],
                            ['label' => 'It guarantees that no military passwords ever need to be changed', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'AI excels at analyzing massive data streams rapidly, alerting personnel to subtle statistical outliers and coordinated distributed attacks.',
                    ],
                ],
            ],

            // Lab 9: Digital Identity Verification, Passphrase Hardening & MFA Defense
            [
                'module_number' => 3,
                'slug' => 'naval-digital-identity-mfa-passphrase-hardening',
                'title' => 'NP-LAB 09: Digital Identity Verification, Passphrase Hardening & MFA Defense',
                'category' => 'identity_access',
                'difficulty' => 'beginner',
                'estimated_minutes' => 45,
                'passing_score' => 75,
                'primary_workspace' => 'general_workbench',
                'scenario_background' => 'During a Naval Provost cybersecurity readiness audit across naval base administrative terminals, investigators discovered pervasive use of predictable credentials (including "naval123", "Musa2026", and "Password1"). Simultaneously, several naval ratings and duty officers reported receiving unexpected multi-factor authentication (MFA) push notifications on their military-issued mobile devices at odd hours (MFA fatigue / push-bombing attacks). Provost personnel must audit weak passwords, construct robust 4-word passphrases with high cryptographic entropy, classify authentication factors according to military taxonomy (Know, Have, Are, Context), and execute the required defensive response to unexpected MFA prompts.',
                'theory_notes' => 'Digital identity represents an entity in cyberspace, while authentication verifies claimed identity. Authentication factors include Something You Know (knowledge), Something You Have (possession), Something You Are (biometrics), and Contextual factors (time/location). In MFA fatigue (push bombing), attackers flood targets with mobile prompts until the user mistakenly or reluctantly approves access. Standard military defense requires denying the prompt immediately and notifying the Provost Cyber Defense Watch.',
                'vocabulary' => [
                    ['term' => 'Digital Identity', 'definition' => 'The electronic representation and attributes of an individual or device within a military information network.'],
                    ['term' => 'MFA Fatigue (Push Bombing)', 'definition' => 'An attack where threat actors spam target devices with repeated MFA prompts to wear down users into approving.'],
                    ['term' => 'Cryptographic Passphrase', 'definition' => 'A sequence of four or more memorable, unrelated words providing superior entropy over short complex passwords.'],
                    ['term' => 'Factor Taxonomy', 'definition' => 'The classification of authentication methods: Something You Know, Have, Are, and Contextual factors.'],
                ],
                'learning_objectives' => 'Audit weak military passwords and evaluate cracking resistance; generate high-entropy 4-word passphrases; correctly classify authentication factor taxonomies; execute defensive protocols against MFA push-bombing campaigns.',
                'instructions' => 'Inspect the credential vulnerability list on your workbench. Identify predictable patterns in passwords such as "naval123" and "Musa2026". Construct a secure four-word military passphrase. Analyze the MFA telemetry log, reject unauthorized push notifications targeting Lieutenant Commander Aminu, and file an urgent Provost security advisory signal.',
                'tasks' => [
                    'Review the flagged credential audit in "/srv/audit/flagged_passwords.txt" and evaluate dictionary vulnerability.',
                    'Construct a hardened 4-word military passphrase exceeding 16 characters with high entropy.',
                    'Classify authentication mechanisms into Know (PIN/Passphrase), Have (CAC Smart Card/Token), Are (Fingerprint/Iris), and Context (Geofence/Duty hours).',
                    'Inspect the MFA authorization alert log ("/var/log/mfa_prompts.log"), isolate unauthorized push prompts from foreign IP 103.22.201.44, execute denial, and file an incident signal.',
                ],
                'evidence_requirements' => ['Weak password audit and cracking vulnerability report', 'Constructed 4-word passphrase entropy analysis', 'Authentication factor taxonomy classification matrix', 'MFA fatigue rejection and provost alert record'],
                'expected_findings' => 'Passwords "naval123" and "Musa2026" fail standard entropy criteria and can be cracked in under 3 seconds. Off-duty officer LCdr Aminu was targeted with 14 unsolicited push prompts in 4 minutes from external IP 103.22.201.44.',
                'remediation_explanation' => 'Enforce mandatory 4-word passphrases (minimum 16 characters), prohibit calendar years and base names, and implement number matching in MFA authenticators to eliminate blind push approvals.',
                'allowed_commands' => ['cat', 'grep', 'wc', 'clear', 'echo'],
                'questions' => [
                    [
                        'prompt' => 'An officer receives an unexpected MFA approval notification on their smartphone at 0200 hours while off duty. What is the mandatory Naval Provost protocol?',
                        'options' => [
                            ['label' => 'Immediately tap "Deny" / "No, it wasn\'t me" and report the incident directly to the Provost Marshal and Cyber Defense Watch', 'is_correct' => true],
                            ['label' => 'Tap "Approve" so the notifications stop ringing and they can return to sleep', 'is_correct' => false],
                            ['label' => 'Ignore the notification and uninstall the military authenticator application', 'is_correct' => false],
                            ['label' => 'Forward the notification screenshot to personal social media groups to ask peers', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Tapping approve grants hostile adversaries instantaneous access. Immediate denial and provost reporting alerts security teams that primary credentials have already been compromised.',
                    ],
                    [
                        'prompt' => 'Which authentication factor category does a Naval Common Access Card (CAC) or hardware cryptographic token belong to?',
                        'options' => [
                            ['label' => 'Something You Have (possession factor)', 'is_correct' => true],
                            ['label' => 'Something You Know (knowledge factor)', 'is_correct' => false],
                            ['label' => 'Something You Are (biometric factor)', 'is_correct' => false],
                            ['label' => 'Somewhere You Are (contextual factor)', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Physical tokens, smart cards, and authentication hardware keys are physical items in the user\'s possession, classifying them under "Something You Have".',
                    ],
                ],
            ],

            // Lab 10: Account Lifecycle Management, Privileged Access & Credential Theft Triage
            [
                'module_number' => 3,
                'slug' => 'naval-account-lifecycle-privileged-credential-triage',
                'title' => 'NP-LAB 10: Account Lifecycle Management, Privileged Access & Credential Theft Triage',
                'category' => 'credential_protection',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'passing_score' => 75,
                'primary_workspace' => 'kali_terminal',
                'scenario_background' => 'Following a routine quarterly personnel rotation at Western Naval Command, the Provost Cyber Inspection Team conducts an Account Lifecycle audit on the base command server. Preliminary discovery shows that transferred officers still retain active root and sudo permissions on legacy servers. Furthermore, a suspicious telephone caller impersonating "Navy Headquarters ICT Directorate" attempted to extract OTP tokens from watch ratings. Meanwhile, server authentication logs display an automated horizontal password spraying attack attempting a single common password ("NavyMarch2026!") across 200 distinct user accounts to evade lockout thresholds.',
                'theory_notes' => 'The Account Lifecycle comprises Creation, Provisioning, Maintenance/Review, and Deprovisioning. Stale or orphaned accounts from redeployed personnel are prime vectors for persistent unauthorized access. Privileged Accounts (sudo/root) demand stringent monitoring and must never be shared among watchstanders, as shared accounts destroy individual accountability and forensic non-repudiation.',
                'vocabulary' => [
                    ['term' => 'Account Deprovisioning', 'definition' => 'The prompt revocation of access privileges and disabling of user accounts when personnel transfer or discharge.'],
                    ['term' => 'Privileged Account', 'definition' => 'An account holding administrative rights capable of modifying security settings, users, or critical databases.'],
                    ['term' => 'Shared Account Hazard', 'definition' => 'The critical vulnerability where multiple operators share one credential, destroying non-repudiation and individual accountability.'],
                    ['term' => 'Password Spraying', 'definition' => 'A horizontal attack attempting a single likely password across numerous accounts to circumvent account lockout policies.'],
                ],
                'learning_objectives' => 'Audit user accounts against personnel posting manifests to detect orphaned accounts; eliminate shared generic administrative accounts to preserve non-repudiation; detect horizontal password spraying patterns in auth logs; apply out-of-band verbal challenge procedures to thwart social engineering vishing.',
                'instructions' => 'Navigate to "/etc/provost/". Inspect the system users in "/etc/passwd" and compare them against "transfer_manifest_q1.csv". Identify active accounts for transferred personnel (e.g., Commander Danjuma, transferred 45 days ago). Audit "/var/log/auth.log" for password spraying indicators, isolate the attacking IP, and document the social engineering telephone triage.',
                'tasks' => [
                    'Cross-reference system accounts in "/etc/passwd" against "transfer_manifest_q1.csv" to identify orphaned accounts.',
                    'Audit the shared account "provost_shared_duty" and formulate individual named credential replacements.',
                    'Use grep and awk to extract authentication failures in "/var/log/auth.log" matching horizontal password spraying with "NavyMarch2026!".',
                    'Identify source IP address 185.220.101.5 and compile an emergency IP block and credential reset manifest.',
                ],
                'evidence_requirements' => ['Orphaned account audit and deprovisioning list', 'Horizontal password spraying forensic extraction', 'Shared administrative account remediation plan', 'Telephone social engineering (vishing) verification record'],
                'expected_findings' => 'Transferred officer account "cdanjuma" remained active with sudo rights 45 days post-transfer. Hostile IP 185.220.101.5 sprayed "NavyMarch2026!" across 200 accounts, compromising 2 weak accounts.',
                'remediation_explanation' => 'Establish automated HR-driven deprovisioning triggers on military transfer orders; eliminate all generic shared accounts in favor of individual named IDs; deploy rate-limiting and fail2ban rules to detect horizontal multi-account sprays.',
                'allowed_commands' => ['cat', 'grep', 'awk', 'wc', 'ls', 'sort', 'uniq', 'clear'],
                'questions' => [
                    [
                        'prompt' => 'Why is using a shared administrative account (such as "watch_desk_admin") strictly forbidden in military and provost operations?',
                        'options' => [
                            ['label' => 'It destroys non-repudiation and forensic accountability, making it impossible to determine which specific watchstander performed an action', 'is_correct' => true],
                            ['label' => 'It causes the server to consume double the electrical power', 'is_correct' => false],
                            ['label' => 'It prevents passwords from having more than six characters', 'is_correct' => false],
                            ['label' => 'Shared accounts cannot connect to local area networks', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'In military judicial and forensic proceedings, non-repudiation requires undeniable proof of individual responsibility. Shared accounts make individual attribution legally impossible.',
                    ],
                    [
                        'prompt' => 'How does a horizontal password spraying attack evade standard account lockout policies?',
                        'options' => [
                            ['label' => 'By testing one single common password across hundreds of different accounts, staying well beneath per-account failed login lockout limits', 'is_correct' => true],
                            ['label' => 'By physically cutting the network fiber cables to the authentication server', 'is_correct' => false],
                            ['label' => 'By trying ten thousand passwords on a single account within five seconds', 'is_correct' => false],
                            ['label' => 'By sending physical letters to the naval dockyard mailroom', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Standard lockouts trigger when one account experiences multiple failed attempts. Password spraying stays under that threshold by testing one guess per account across hundreds of users.',
                    ],
                ],
            ],

            // Lab 11: Multi-Model Access Control (DAC/MAC/RBAC/ABAC) & Facility Visitor Security
            [
                'module_number' => 3,
                'slug' => 'naval-access-control-models-facility-visitor-security',
                'title' => 'NP-LAB 11: Multi-Model Access Control (DAC/MAC/RBAC/ABAC) & Facility Visitor Security',
                'category' => 'access_control',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 45,
                'passing_score' => 75,
                'primary_workspace' => 'kali_terminal',
                'scenario_background' => 'At the Naval Intelligence Operations Centre (NIOC), physical and logical access controls work in tandem. An unannounced third-party HVAC contractor arrives at the perimeter checkpoint claiming an emergency repair ticket for the secure server vault. Meanwhile, a system security audit in the terminal reveals that file access rights across four access control models (DAC, MAC, RBAC, ABAC) require immediate alignment. Specifically, classified operational intelligence folders have overly permissive Discretionary (chmod 777) settings, Role-Based Access Control rules for Provost watchstanders need hardening, and physical tailgating vulnerabilities at the server room mantrap require procedural enforcement.',
                'theory_notes' => 'Access control models govern subject-object interactions: Discretionary Access Control (DAC) grants access based on object owner discretion (POSIX chmod/chown); Mandatory Access Control (MAC) enforces strict non-negotiable security clearance labels (e.g. SECRET); Role-Based Access Control (RBAC) assigns permissions based on defined job duties; Attribute-Based Access Control (ABAC) dynamically assesses contextual attributes (time, location, device security). Physical controls (visitor logs, mandatory 1:1 escorts, anti-tailgating mantraps) provide depth in defense.',
                'vocabulary' => [
                    ['term' => 'DAC (Discretionary Access Control)', 'definition' => 'Access control where the file creator/owner determines permissions and rights for others.'],
                    ['term' => 'MAC (Mandatory Access Control)', 'definition' => 'Centrally mandated access determined by clearance level and document classification labels, not by individual users.'],
                    ['term' => 'RBAC (Role-Based Access Control)', 'definition' => 'Access governance based on organizational role and assigned responsibilities.'],
                    ['term' => 'ABAC (Attribute-Based Access Control)', 'definition' => 'Dynamic access evaluation using subject, object, action, and environmental attributes (e.g., duty hours, secure subnet).'],
                    ['term' => 'Tailgating / Piggybacking', 'definition' => 'An unauthorized individual following an authorized person through a secured entry without scanning individual credentials.'],
                ],
                'learning_objectives' => 'Distinguish and configure DAC, MAC, RBAC, and ABAC access control policies; audit and remediate permissive Linux file permissions (chmod 640); enforce physical visitor verification and continuous escort protocols; mitigate physical tailgating risks through procedural and physical controls.',
                'instructions' => 'Review the physical visitor entry request for the HVAC contractor on your workbench. Confirm lack of prior authorization and enforce visitor escort holding procedures. In the terminal, navigate to "/data/intel_ops/", inspect DAC permissions using "ls -la", correct world-accessible files using "chmod 640", and map the access rules into the four access control models.',
                'tasks' => [
                    'Evaluate the contractor visitor verification request and enforce 100% escort and out-of-band authorization checks.',
                    'Analyze the physical server room entry log and document the tailgating violation at Door B2.',
                    'Audit file permissions in "/data/intel_ops/" using "ls -la" and remediate dangerous 777 permissions to 640.',
                    'Classify military security policies into DAC, MAC, RBAC, and ABAC categories in the configuration register.',
                ],
                'evidence_requirements' => ['Physical visitor access authorization report', 'Anti-tailgating intercept log and mantrap inspection', 'Remediated DAC file permission listing (chmod 640)', 'Four-model access control comparison register'],
                'expected_findings' => 'Contractor lacked a valid work ticket and was attempting unescorted entry. Classified reconnaissance file "operation_sea_guard.dat" possessed world-writable 777 permissions, which were successfully remediated to 640.',
                'remediation_explanation' => 'Enforce strict 1:1 continuous military escort for all civilian contractors in sensitive compartments; install automated interlocking mantrap doors to eliminate tailgating; apply chmod 640 and chown root:provost_intel across operational directories.',
                'allowed_commands' => ['ls', 'chmod', 'chown', 'cat', 'grep', 'clear', 'diff'],
                'questions' => [
                    [
                        'prompt' => 'Under a Mandatory Access Control (MAC) military architecture, what governs whether a naval rating can view a document labeled "SECRET"?',
                        'options' => [
                            ['label' => 'The rating must hold a verified SECRET clearance or higher AND an official Need-to-Know, independent of the document creator\'s wishes', 'is_correct' => true],
                            ['label' => 'The document creator decides to share it with them in a shared folder', 'is_correct' => false],
                            ['label' => 'The rating has served on the base for more than two consecutive years', 'is_correct' => false],
                            ['label' => 'The document was downloaded from the public military website', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Under MAC, system-enforced labels and security clearances determine access. The individual creator has no authority to grant access beyond clearance boundaries.',
                    ],
                    [
                        'prompt' => 'What physical control mechanism is most effective in preventing an unauthorized person from tailgating an authorized officer into a secure cryptographic server room?',
                        'options' => [
                            ['label' => 'An access-controlled mantrap (airlock entry) or interlocking turnstile permitting only one verified person to pass at a time', 'is_correct' => true],
                            ['label' => 'A printed warning sign pasted on the wall asking personnel to close the door gently', 'is_correct' => false],
                            ['label' => 'Propping the door open with a wooden wedge during shift changeover', 'is_correct' => false],
                            ['label' => 'Painting the door gray so it blends into the corridor wall', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'A mantrap with interlocking doors and presence sensors physically ensures that only one credentialed individual can enter at a time, eliminating tailgating.',
                    ],
                ],
            ],

            // Lab 12: Operation Secure Access: Identity Compromise Response & Provost Incident Triage
            [
                'module_number' => 3,
                'slug' => 'naval-operation-secure-access-identity-compromise-triage',
                'title' => 'NP-LAB 12: Operation Secure Access: Identity Compromise Response & Provost Incident Triage',
                'category' => 'incident_response',
                'difficulty' => 'intermediate',
                'estimated_minutes' => 50,
                'passing_score' => 75,
                'primary_workspace' => 'general_workbench',
                'scenario_background' => 'Operation Secure Access Tabletop Scenario: During the 0230 midnight watch, the Naval Provost Duty Operations Officer receives five simultaneous incident dispatches: Event 1 - Sub-Lieutenant Adebayo reports his military Common Access Smart ID card was lost during a transit taxi ride; Event 2 - A privileged administrator account logged in from an unknown foreign IP address (194.26.29.112) accessing the Naval Armory Database; Event 3 - Multiple duty personnel report unexpected MFA approval alerts on their phones; Event 4 - An unbadged individual in blue overalls was observed departing the server room corridor; Event 5 - A suspicious USB flash drive labeled "Naval Welfare Promotion List 2026" was found inserted into an unclassified terminal in the muster hall. Trainees must apply the 5-step military first-response sequence (Notice, Do Not Approve, Report, Recover, Document) and complete the official Naval Provost Incident Report Worksheet.',
                'theory_notes' => 'When identity and access controls fail, the speed and rigor of the initial provost response determines whether an adversary gains full persistence. The 5-step response sequence comprises: 1) Notice anomaly, 2) Do Not Approve / Halt propagation, 3) Report through military chain of command, 4) Recover assets and revoke credentials, and 5) Document with evidentiary rigor for court-martial proceedings.',
                'vocabulary' => [
                    ['term' => '5-Step Response Sequence', 'definition' => 'The military standard: Notice anomaly, Do Not Approve unauthorized access, Report up chain, Recover assets, Document forensically.'],
                    ['term' => 'Incident Report Worksheet', 'definition' => 'The standardized provost military form detailing incident timeline, affected assets, impact rating, and defensive interventions.'],
                    ['term' => 'Session Invalidation', 'definition' => 'Immediately terminating active cryptographic tokens and TCP/SSH sessions of compromised accounts.'],
                    ['term' => 'Tabletop Simulation', 'definition' => 'A structured, scenario-driven operational exercise to test incident readiness and chain-of-command reporting under pressure.'],
                ],
                'learning_objectives' => 'Prioritize concurrent high-impact security incidents under operational pressure; execute the 5-step military identity compromise response sequence; immediately revoke lost smart card credentials and terminate unauthorized administrative sessions; complete a forensically rigorous Naval Provost Incident Report Worksheet.',
                'instructions' => 'Review the 5 tabletop incident feeds on your provost workbench. Rank the events by operational risk and containment urgency. Execute immediate credential revocation for Sub-Lieutenant Adebayo\'s lost smart card. Terminate the active unauthorized foreign admin session (194.26.29.112) on the armory database. Complete all sections of the Naval Provost Incident Report Worksheet.',
                'tasks' => [
                    'Triage and rank the 5 tabletop incidents based on operational risk to naval assets.',
                    'Trigger emergency certificate revocation for Sub-Lieutenant Adebayo\'s lost Common Access Smart ID card.',
                    'Terminate the active rogue SSH session linked to foreign IP 194.26.29.112 on the armory server.',
                    'Complete the standardized Naval Provost Incident Report Worksheet including timeline, containment actions, and evidence preservation hashes.',
                ],
                'evidence_requirements' => ['Prioritized tabletop event triage matrix', 'Smart card certificate revocation dispatch', 'Rogue administrative session kill confirmation', 'Completed Naval Provost Incident Report Worksheet'],
                'expected_findings' => 'Event 2 (rogue foreign admin session on Armory Database) and Event 1 (lost military smart ID) posed catastrophic risks requiring immediate session termination and certificate revocation. The 5-step sequence successfully halted lateral movement.',
                'remediation_explanation' => 'Enforce immediate smart card certificate revocation via CRL/OCSP; mandate out-of-band verification on all off-hours privileged sessions; deploy provost physical security patrols to secure perimeter breaches.',
                'allowed_commands' => ['cat', 'grep', 'kill', 'ps', 'pkill', 'clear', 'echo'],
                'questions' => [
                    [
                        'prompt' => 'What is the immediate, non-negotiable first action a naval watchstander must take upon realizing their military smart ID card is missing or stolen?',
                        'options' => [
                            ['label' => 'Immediately report the loss to the Provost Duty Officer and system administrator so the cryptographic certificate can be revoked without delay', 'is_correct' => true],
                            ['label' => 'Wait 48 hours to see if someone returns it to the mess hall', 'is_correct' => false],
                            ['label' => 'Borrow an associate\'s smart card and continue working as normal', 'is_correct' => false],
                            ['label' => 'Keep silent to avoid a disciplinary reprimand', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'Prompt reporting allows administrators to immediately revoke the card certificate in the directory, neutralizing its cryptographic access capability before adversaries can exploit it.',
                    ],
                    [
                        'prompt' => 'According to the Naval Provost standard operating procedure, what is the correct sequence of the 5-step identity compromise response protocol?',
                        'options' => [
                            ['label' => 'Notice -> Do Not Approve -> Report -> Recover -> Document', 'is_correct' => true],
                            ['label' => 'Document -> Recover -> Notice -> Report -> Do Not Approve', 'is_correct' => false],
                            ['label' => 'Approve -> Notice -> Recover -> Delete -> Forget', 'is_correct' => false],
                            ['label' => 'Report -> Document -> Guess -> Approve -> Notice', 'is_correct' => false],
                        ],
                        'correct_answer_explanation' => 'The handbook sequence is: Notice the anomaly, Do Not Approve unauthorized prompts, Report immediately up the chain of command, Recover assets/revoke credentials, and Document the complete factual record.',
                    ],
                ],
            ],
        ];
    }
}
