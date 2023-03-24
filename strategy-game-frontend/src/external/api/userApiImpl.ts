import {
    CodeDeliveryError,
    InvalidEmailOrPasswordError,
    UserAlreadyExistsError,
    UserApi,
    UserNotConfirmedError,
    UserNotFoundError,
} from "../../core/required/userApi";
import {UserRepository} from "../../core/required/userRepository";
import {HttpClient} from "./http/httpClient";
import {ResponseUtils} from "./http/responseUtils";
import {UnauthorizedError, UnexpectedError} from "../../shared/error";
import handleErrorResponses = ResponseUtils.handleErrorResponses;

export class UserApiImpl implements UserApi {

    private readonly httpClient: HttpClient;
    private readonly userRepository: UserRepository;


    constructor(httpClient: HttpClient, userRepository: UserRepository) {
        this.httpClient = httpClient;
        this.userRepository = userRepository;
    }


    signUp(email: string, password: string, username: string): Promise<void> {
        return this.httpClient
            .post({
                url: "/api/user/signup",
                body: {
                    email: email,
                    password: password,
                    username: username,
                },
            })
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "CodeDeliveryError") return new CodeDeliveryError();
                if (error.status === "InvalidEmailOrPasswordError") return new InvalidEmailOrPasswordError();
                if (error.status === "UserAlreadyExistsError") return new UserAlreadyExistsError();
                return new UnexpectedError(error.status);
            }))
            .then(() => undefined);
    }


    login(email: string, password: string): Promise<string> {
        return this.httpClient
            .post({
                url: "/api/user/login",
                body: {
                    email: email,
                    password: password,
                },
            })
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "Unauthorized") return new UnauthorizedError();
                if (error.status === "UserNotConfirmedError") return new UserNotConfirmedError();
                if (error.status === "UserNotFoundError") return new UserNotFoundError();
                return new UnexpectedError(error.status);
            }))
            .then(response => response.json())
            .then(data => data.idToken);
    }

    deleteUser(email: string, password: string): Promise<void> {
        return this.httpClient
            .post({
                url: "/api/user/delete",
                body: {
                    email: email,
                    password: password,
                },
                requireAuth: true,
                token: this.userRepository.getAuthToken(),
            })
            .then(response => handleErrorResponses(response, error => {
                if (error.status === "Unauthorized") return new UnauthorizedError();
                return new UnexpectedError(error.status);
            }))
            .then(() => undefined);
    }

}