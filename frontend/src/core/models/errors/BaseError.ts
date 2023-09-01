import {BaseErrorType} from "./BaseErrorType";

export class BaseError extends Error {

    private readonly type: BaseErrorType;

    constructor(type: BaseErrorType) {
        super();
        this.type = type;
    }

    getType(): BaseErrorType {
        return this.type;
    }

}
