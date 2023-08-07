import {BaseError} from "./BaseError";
import {BaseErrorType} from "./BaseErrorType";

export class UnauthorizedError extends BaseError {
    constructor() {
        super(BaseErrorType.UNAUTHORIZED);
    }
}