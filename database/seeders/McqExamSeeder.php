<?php

namespace Database\Seeders;

use App\Models\Cohort;
use App\Models\Programme;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Seeder;

class McqExamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programme = Programme::first();
        $cohort = Cohort::first();

        // 1. Create Flagship Exam
        $exam = Quiz::updateOrCreate(
            ['slug' => 'naval-provost-module-3-cyber-qualification-exam'],
            [
                'title' => 'Naval Provost Cyber Security & Access Control Qualification Exam (Module 3)',
                'description' => 'Official qualification examination for Naval Provost & Military Intelligence personnel on identity, authentication, access control mechanisms, OPSEC, and CIA triad application.',
                'instructions' => 'Read each scenario carefully. Select the authorized tactical response according to naval cybersecurity doctrine. The exam is strictly timed.',
                'category' => 'access_control',
                'exam_type' => 'mcq',
                'programme_id' => $programme?->id,
                'cohort_id' => $cohort?->id,
                'time_limit_minutes' => 30,
                'passing_score_percentage' => 70,
                'max_attempts' => 3,
                'randomize_questions' => true,
                'randomize_options' => true,
                'show_correct_answers_after' => true,
                'is_published' => true,
            ]
        );

        // 2. Questions & Scenarios
        $questions = [
            [
                'prompt' => 'During an offshore tactical mission, an automated ransomware payload encrypts the bridge radar telemetry server. Which core pillar of the CIA Triad is directly compromised?',
                'points' => 10,
                'explanation' => 'Ransomware denies authorized operators access to operational telemetry systems, directly violating the Availability pillar of the CIA Triad.',
                'options' => [
                    ['id' => 'a', 'text' => 'Confidentiality', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Integrity', 'is_correct' => false],
                    ['id' => 'c', 'text' => 'Availability', 'is_correct' => true],
                    ['id' => 'd', 'text' => 'Non-Repudiation', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'Under military information classification standards, what is the designation for classified materials whose unauthorized disclosure would cause "exceptionally grave damage" to national security?',
                'points' => 10,
                'explanation' => 'Top Secret classification is reserved for information whose compromise causes exceptionally grave damage. Secret causes serious damage; Confidential causes damage.',
                'options' => [
                    ['id' => 'a', 'text' => 'Confidential', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Secret', 'is_correct' => false],
                    ['id' => 'c', 'text' => 'Top Secret', 'is_correct' => true],
                    ['id' => 'd', 'text' => 'Restricted Military', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'A naval intelligence operative authenticates to a secure terminal using a Common Access Card (CAC) and a 6-digit PIN. Which two authentication factor categories are represented?',
                'points' => 10,
                'explanation' => 'The CAC card is a physical token representing "Something you have", while the memorized PIN represents "Something you know".',
                'options' => [
                    ['id' => 'a', 'text' => 'Something you have AND Something you are', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Something you know AND Something you have', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'Something you are AND Somewhere you are', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Something you do AND Something you know', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'In Role-Based Access Control (RBAC), which security directive dictates that a newly posted Naval Provost Petty Officer receives only the explicit privileges necessary to conduct active watch duty?',
                'points' => 10,
                'explanation' => 'The Principle of Least Privilege (PoLP) requires limiting user access privileges strictly to the minimum necessary to perform assigned operational duties.',
                'options' => [
                    ['id' => 'a', 'text' => 'Principle of Least Privilege (PoLP)', 'is_correct' => true],
                    ['id' => 'b', 'text' => 'Implicit Allow by Default', 'is_correct' => false],
                    ['id' => 'c', 'text' => 'Separation of Dual Duties', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Discretionary Inheritance', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'Why must military password storage systems append a cryptographically random salt to passwords prior to hashing?',
                'points' => 10,
                'explanation' => 'Cryptographic salting guarantees that identical passwords yield distinct hash digests, completely neutralizing precomputed rainbow table attacks.',
                'options' => [
                    ['id' => 'a', 'text' => 'To compress password lengths for faster database indexing', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'To neutralize precomputed rainbow table dictionary attacks', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'To enable two-way plaintext decryption by administrators', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'To satisfy legacy ASCII transmission protocols', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'A watch officer receives an urgent email purporting to originate from the Chief of Naval Staff instructing immediate upload of crew manifests via an external link. What vector of social engineering is being executed?',
                'points' => 10,
                'explanation' => 'Targeted attacks posing as trusted senior leaders to deceive specific personnel into compromising operational data constitute Spear-Phishing / Executive Impersonation.',
                'options' => [
                    ['id' => 'a', 'text' => 'Watering Hole Reconnaissance', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Spear-Phishing / Executive Impersonation', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'DNS Cache Poisoning', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Shoulder Surfing Vector', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'A trainee posts a selfie on social media while stationed at an undisclosed maritime refueling port, geotagging their exact coordinates. Which doctrine was violated?',
                'points' => 10,
                'explanation' => 'Disclosing geolocation coordinates and movements of military assets on public media is a direct violation of Operational Security (OPSEC).',
                'options' => [
                    ['id' => 'a', 'text' => 'Electronic Counter-Measures (ECM)', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Operational Security (OPSEC)', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'Discretionary Cryptography', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Signal Intelligence Discretion', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'Which cryptographic paradigm utilizes a mathematically linked public-private key pair to enable digital signatures and secure key exchanges?',
                'points' => 10,
                'explanation' => 'Asymmetric Cryptography (public-key cryptography) utilizes paired public and private keys for encryption, digital signatures, and key negotiation.',
                'options' => [
                    ['id' => 'a', 'text' => 'Symmetric Block Encryption', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Asymmetric (Public-Key) Cryptography', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'Stream Cipher XOR Matrix', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'One-Way Hashing Digest', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'What is the immediate primary tactical objective of a Security Operations Center (SOC) analyst upon confirming an active remote command-and-control (C2) intrusion on a patrol vessel workstation?',
                'points' => 10,
                'explanation' => 'Containment and network isolation prevents the adversary from pivoting laterally across the tactical vessel network or exfiltrating data.',
                'options' => [
                    ['id' => 'a', 'text' => 'Format the hard drive immediately without capturing memory artifacts', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Isolate the host from the network to contain lateral propagation', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'Counter-hack the foreign C2 IP address immediately', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Ignore the beacon if operational mission tasks are running', 'is_correct' => false],
                ],
            ],
            [
                'prompt' => 'A cybersecurity specialist compares the SHA-256 hash of a downloaded firmware binary with the official defense contractor published hash. Which security property is being validated?',
                'points' => 10,
                'explanation' => 'Cryptographic hashing verifies Data Integrity — ensuring the firmware has not been tampered with, corrupted, or backdoored in transit.',
                'options' => [
                    ['id' => 'a', 'text' => 'Confidentiality of the code', 'is_correct' => false],
                    ['id' => 'b', 'text' => 'Data Integrity and Authenticity', 'is_correct' => true],
                    ['id' => 'c', 'text' => 'High Availability SLA', 'is_correct' => false],
                    ['id' => 'd', 'text' => 'Legal Non-Repudiation', 'is_correct' => false],
                ],
            ],
        ];

        // Clear existing questions for clean seed
        $exam->questions()->delete();

        foreach ($questions as $index => $qData) {
            $exam->questions()->create([
                'prompt' => $qData['prompt'],
                'points' => $qData['points'],
                'explanation' => $qData['explanation'],
                'options' => $qData['options'],
                'order' => $index + 1,
                'type' => 'multiple_choice',
            ]);
        }

        // 3. Seed sample attempts for realistic analytics telemetry
        $trainees = User::where('role', 'trainee')->take(5)->get();
        if ($trainees->isEmpty()) {
            $trainees = User::take(3)->get();
        }

        foreach ($trainees as $idx => $trainee) {
            $existingAttempt = QuizAttempt::where('quiz_id', $exam->id)->where('user_id', $trainee->id)->first();
            if ($existingAttempt) {
                continue;
            }

            // Simulate score (80% or 90% or 60%)
            $simulatedScore = ($idx % 3 === 0) ? 90 : (($idx % 3 === 1) ? 80 : 60);
            $isPassed = $simulatedScore >= $exam->passing_score_percentage;

            QuizAttempt::create([
                'quiz_id' => $exam->id,
                'user_id' => $trainee->id,
                'attempt_number' => 1,
                'status' => 'graded',
                'started_at' => now()->subHours(2),
                'expires_at' => now()->subHours(2)->addMinutes(30),
                'submitted_at' => now()->subHours(2)->addMinutes(18),
                'answers_state' => [1 => 'c', 2 => 'c', 3 => 'b', 4 => 'a', 5 => 'b'],
                'total_score' => $simulatedScore,
                'score_percentage' => $simulatedScore,
                'is_passed' => $isPassed,
            ]);
        }
    }
}
