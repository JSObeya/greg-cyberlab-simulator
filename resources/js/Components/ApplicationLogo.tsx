import React from 'react';

export default function ApplicationLogo({ className = 'h-9 w-auto', ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo.png"
            alt="Greg & Co. ICT Limited"
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
