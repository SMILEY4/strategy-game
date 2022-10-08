import {UserApi} from "../../core/required/userApi";
import {UserRepository} from "../../core/required/userRepository";
import {AuthData} from "../../models/authData";
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
                    username: username
                },
            })
            .then(() => undefined);
    }


    login(email: string, password: string): Promise<AuthData> {
        return this.httpClient
            .post({
                url: "/api/user/login",
                body: {
                    email: email,
                    password: password,
                },
            })
            .then(response => response.json())
            .then(data => ({
                idToken: data.idToken,
                refreshToken: data.refreshToken
            }));
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
                token: this.userRepository.getAuthToken()
            })
            .then(() => undefined);
    }

}