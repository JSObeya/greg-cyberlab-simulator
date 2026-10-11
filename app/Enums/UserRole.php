<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case INSTRUCTOR = 'instructor';
    case TRAINEE = 'trainee';
    case AUDITOR = 'auditor';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Administrator',
            self::ADMIN => 'Administrator',
            self::INSTRUCTOR => 'Instructor',
            self::TRAINEE => 'Trainee',
            self::AUDITOR => 'Auditor / Observer',
        };
    }
}
