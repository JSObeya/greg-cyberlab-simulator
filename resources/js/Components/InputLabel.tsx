import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
