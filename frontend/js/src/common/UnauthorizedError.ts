export enum BaseErrorType {
    UNEXPECTED = "Unexpected",
    UNAUTHORIZED = "Unauthorized",
}

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