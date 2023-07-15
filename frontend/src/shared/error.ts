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