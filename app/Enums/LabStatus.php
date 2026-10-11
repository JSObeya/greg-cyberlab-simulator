<?php

namespace App\Enums;

enum LabStatus: string
{
    case DRAFT = 'draft';
    case UNDER_REVIEW = 'under_review';
    case PUBLISHED = 'published';
    case SCHEDULED = 'scheduled';
    case ACTIVE = 'active';
    case CLOSED = 'closed';
    case ARCHIVED = 'archived';
}
