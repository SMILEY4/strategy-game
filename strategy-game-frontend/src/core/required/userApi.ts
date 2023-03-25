import {BaseError} from "../../shared/error";

export interface UserApi {
    signUp: (email: string, password: string, username: string) => Promise<void>;
    login: (email: string, password: string) => Promise<string>;
    deleteUser: (email: string, password: string) => Promise<void>;
}

export class UserApiError extends BaseError {
    constructor(errorCode: string, message: string) {
        super(errorCode, message);
    }
}

export class UnauthorizedError extends UserApiError {
    constructor() {
        super("Unauthorized", "The provided email or password is invalid");
    }
}

export class UserNotConfirmedError extends UserApiError {
    constructor() {
        super("UserNotConfirmed", "The user has not confirmed the code.");
    }
}

export class UserNotFoundError extends UserApiError {
    constructor() {
        super("UserNotFound", "The user does not exist.");
    }
}

export class CodeDeliveryError extends UserApiError {
    constructor() {
        super("UserNotFound", "The user does not exist.");
    }
}

export class InvalidEmailOrPasswordError extends UserApiError {
    constructor() {
        super("UserNotFound", "The user does not exist.");
    }
}

export class UserAlreadyExistsError extends UserApiError {
    constructor() {
        super("UserNotFound", "The user does not exist.");
    }
}
