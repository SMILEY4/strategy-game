import {BaseError} from "./BaseError";
import {BaseErrorType} from "./BaseErrorType";

export class UnauthorizedError extends BaseError {
    constructor() {
        super(BaseErrorType.UNAUTHORIZED);
    }

    static handle<T>(error: any, block: () => T): T {
        if (error instanceof UnauthorizedError) {
            return block();
        } else {
            throw error;
        }
    }

}