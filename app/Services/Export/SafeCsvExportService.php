<?php

namespace App\Services\Export;

class SafeCsvExportService
{
    /**
     * Sanitizes CSV field values to prevent CSV / Spreadsheet formula injection.
     * Escapes initial characters '=', '+', '-', '@', '\t', '\r'.
     */
    public static function escapeField(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $string = (string) $value;

        if ($string === '') {
            return '';
        }

        $dangerousChars = ['=', '+', '-', '@', "\t", "\r"];

        if (in_array($string[0], $dangerousChars, true)) {
            return "'" . $string;
        }

        return $string;
    }

    /**
     * Generate safe CSV string from array of rows.
     */
    public static function generate(array $headers, array $rows): string
    {
        $output = fopen('php://temp', 'r+');

        $safeHeaders = array_map([self::class, 'escapeField'], $headers);
        fputcsv($output, $safeHeaders);

        foreach ($rows as $row) {
            $safeRow = array_map([self::class, 'escapeField'], (array) $row);
            fputcsv($output, $safeRow);
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv ?: '';
    }
}
