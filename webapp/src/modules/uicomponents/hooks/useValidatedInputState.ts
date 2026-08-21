import {useState} from "react";

/** Result of validating a single input field. */
export type ValidationResult<TReason extends string> = { valid: true } | { valid: false, reason: TReason }

/** State and handlers for a validated text input field. */
export interface UseValidatedInputStateData<TReason extends string> {
    value: string,
    validation: ValidationResult<TReason>,
    dirty: boolean,
    onChange: (value: string) => void,
    onCommit: (value: string) => void,
    setValidation: (validation: ValidationResult<TReason>) => void
}


/** Hook for managing a text input with validation on commit. */
export function useValidatedInput<TReason extends string>(
    initial: ValidationResult<TReason>,
    validate: (value: string) => ValidationResult<TReason>,
): UseValidatedInputStateData<TReason> {

    const [value, setValue] = useState<string>("");
    const [dirty, setDirty] = useState<boolean>(false);
    const [validation, setValidation] = useState<ValidationResult<TReason>>(initial);

    function handleChange(value: string) {
        setDirty(true);
        setValue(value);
        setValidation({valid: true});
    }

    function handleCommit(value: string) {
        setValidation(validate(value));
    }

    return {
        value: value,
        validation: validation,
        dirty: dirty,
        onChange: handleChange,
        onCommit: handleCommit,
        setValidation: setValidation,
    };
}