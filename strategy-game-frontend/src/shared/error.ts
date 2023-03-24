import {UserApiError} from "../core/required/userApi";

export class BaseError extends Error {

    public readonly errorCode: string;

    constructor(errorCode: string, message: string) {
        super("[" + errorCode + "]" + message);
        this.errorCode = errorCode;
    }
}

export class UnexpectedError extends BaseError {
    constructor(errorCode: string) {
        super(errorCode, "An unexpected error oc curred.");
    }
}

export class UnauthorizedError extends UserApiError {
    constructor() {
        super("Unauthorized", "The provided email or password is invalid");
    }
}