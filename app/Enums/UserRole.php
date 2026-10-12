<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case ACADEMIC_COORDINATOR = 'academic_coordinator';
    case INSTRUCTOR = 'instructor';
    case TEACHING_ASSISTANT = 'teaching_assistant';
    case TRAINEE = 'trainee';
    case AUDITOR = 'auditor';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Administrator',
            self::ADMIN => 'Administrator',
            self::ACADEMIC_COORDINATOR => 'Academic Coordinator',
            self::INSTRUCTOR => 'Instructor',
            self::TEACHING_ASSISTANT => 'Teaching Assistant',
            self::TRAINEE => 'Trainee',
            self::AUDITOR => 'Auditor / Observer',
        };
    }
}
