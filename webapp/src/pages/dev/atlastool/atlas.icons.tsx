import type {ReactElement} from "react";

export function LockIcon(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/>
            <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7"/>
        </svg>
    );
}

export function UnlockIcon(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <rect x="3.5" y="7" width="9" height="6.5" rx="1.5"/>
            <path d="M5.5 7V5.5a2.5 2.5 0 0 1 4.5-1.2"/>
        </svg>
    );
}

export function ToolIconSelect(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M3.5 2v11.2l3.1-3.1h4.2L3.5 2z"/>
        </svg>
    );
}

export function ToolIconDraw(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="2.75" y="2.75" width="10.5" height="10.5" rx="1"/>
        </svg>
    );
}

export function ToolIconPan(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path
                d="M5.5 3a1 1 0 0 1 2 0v4.5h1.75V2a1 1 0 0 1 2 0v5.5h1.75V4.5a1 1 0 0 1 2 0v5.25A4.25 4.25 0 0 1 11 14H9.5a3 3 0 0 1-2.2-.98L4 9.7a1 1 0 0 1 1.45-1.38L6.5 9.6V3z"/>
        </svg>
    );
}

export function ViewIconFit(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/>
        </svg>
    );
}

export function ViewIconReset(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M13 8a5 5 0 1 1-1.5-3.54M13 2.5V6H9.5"/>
        </svg>
    );
}

export function UndoIcon(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3L3 6l3 3"/>
            <path d="M3 6h6.5a3.5 3.5 0 0 1 0 7H7"/>
        </svg>
    );
}

export function RedoIcon(): ReactElement {
    return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 3l3 3-3 3"/>
            <path d="M13 6H6.5a3.5 3.5 0 0 0 0 7H9"/>
        </svg>
    );
}