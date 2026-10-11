<?php

namespace App\Enums;

enum AttemptStatus: string
{
    case NOT_STARTED = 'not_started';
    case IN_PROGRESS = 'in_progress';
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case PASSED = 'passed';
    case FAILED = 'failed';
    case RETURNED = 'returned_for_correction';
}
