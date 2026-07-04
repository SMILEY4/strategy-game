/** Result type for user input validation. */
export type UserValidationResult<TErrorReason extends string> = { valid: true } | { valid: false, reason: TErrorReason }

/** Validation functions for user registration form fields. */
export const UserValidations = {

    username(value: string): UserValidationResult<"empty"> {
        if (value.trim().length === 0) {
            return {valid: false, reason: "empty"};
        }
        return {valid: true};
    },

    password(value: string): UserValidationResult<"empty"> {
        if (value.trim().length === 0) {
            return {valid: false, reason: "empty"};
        }
        return {valid: true};
    },

    passwordConfirmation(value: string, password: string): UserValidationResult<"empty" | "mismatch"> {
        if (value.trim().length === 0) {
            return {valid: false, reason: "empty"};
        }
        if (value !== password) {
            return {valid: false, reason: "mismatch"};
        }
        return {valid: true};
    },

};