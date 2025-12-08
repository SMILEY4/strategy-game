import {HttpErrorCodes} from "../http/http.status-codes";
import {DetailedError, HttpErrorResponseBody} from "../../common/detailedError";
import {authHandlerUserAuthToken} from "../authentication/auth.handler.user-auth-token";
import {App} from "../../appContext";


export namespace UserClientTypes {

    //==== SIGN-UP =================================

    const signUpErrorCodeValues = ["CODE_DELIVERY_FAILED", "INVALID_EMAIL_OR_PASSWORD", "USER_ALREADY_EXISTS"] as const;

    export type SignUpErrorCodes = typeof signUpErrorCodeValues[number];

    export function isSignUpError(err: unknown): err is DetailedError<LogInErrorCodes> {
        return err instanceof DetailedError && signUpErrorCodeValues.includes(err.errorCode);
    }

    //==== LOG-IN ==================================

    const logInErrorCodeValues = ["UNAUTHORIZED", "USER_NOT_CONFIRMED", "USER_NOT_FOUND"] as const;

    export type LogInErrorCodes = typeof logInErrorCodeValues[number];

    export function isLogInError(err: unknown): err is DetailedError<LogInErrorCodes> {
        return err instanceof DetailedError && logInErrorCodeValues.includes(err.errorCode);
    }

    //==== DELETE ==================================

    const deleteErrorCodeValues = ["UNAUTHORIZED", "USER_NOT_CONFIRMED", "USER_NOT_FOUND"] as const;

    export type DeleteErrorCodes = typeof deleteErrorCodeValues[number];

    export function isDeleteError(err: unknown): err is DetailedError<DeleteErrorCodes> {
        return err instanceof DetailedError && deleteErrorCodeValues.includes(err.errorCode);
    }

}

export const UserClient = {

    signUp(email: string, password: string, username: string): Promise<void> {

        type Request = {
            email: string,
            password: string,
            username: string,
        }

        type Response =
            | { status: 200; body: null }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<UserClientTypes.SignUpErrorCodes> }

        return App.newHttpClient
            .post<Request, Response>("/api/user/signup", {
                body: {
                    email: email,
                    password: password,
                    username: username,
                },
            })
            .then(response => {
                if (response.status === 200) return undefined;
                throw new DetailedError<UserClientTypes.SignUpErrorCodes>(response.body);
            });
    },

    logIn(email: string, password: string): Promise<{ idToken: string, refreshToken?: string }> {

        type Request = {
            email: string,
            password: string,
        }

        type Response =
            | { status: 200; body: { idToken: string, refreshToken: string | undefined } }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<UserClientTypes.LogInErrorCodes> }

        return App.newHttpClient
            .post<Request, Response>("/api/user/login", {
                body: {
                    email: email,
                    password: password,
                },
            })
            .then(response => {
                if (response.status === 200) return response.body;
                throw new DetailedError<UserClientTypes.LogInErrorCodes>(response.body);
            });
    },

    delete(email: string, password: string): Promise<void> {

        type Request = {
            email: string,
            password: string,
        }

        type Response =
            | { status: 200; body: null }
            | { status: HttpErrorCodes, body: HttpErrorResponseBody<UserClientTypes.LogInErrorCodes> }

        return App.newHttpClient
            .post<Request, Response>("/api/user/delete", {
                auth: authHandlerUserAuthToken,
                body: {
                    email: email,
                    password: password,
                },
            })
            .then(response => {
                if (response.status === 200) return undefined;
                throw new DetailedError<UserClientTypes.LogInErrorCodes>(response.body);
            });
    },

};