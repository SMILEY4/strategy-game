import {UserApi} from "../../core/required/userApi";
import {UserRepository} from "../../core/required/userRepository";
import {HttpClient} from "./http/httpClient";

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
            .catch(() => {
                throw new UserLoginException("Network error");
            })
            .then(async response => {
                if (this.isSuccessful(response)) {
                    return response;
                } else {
                    throw new UserLoginException(await this.getErrorCode(response));
                }
            })
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
            .then(() => undefined);
    }

    private isSuccessful(response: Response): boolean {
        return 200 <= response.status && response.status < 400;
    }

    private async getErrorCode(response: Response): Promise<string> {
        return (await response.json()).status;
    }

}

export class UserLoginException extends Error {
    constructor(error: string) {
        super("Login failed: " + error);
    }
}