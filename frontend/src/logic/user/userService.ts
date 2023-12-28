import {UserClient} from "./userClient";
import jwt_decode from "jwt-decode";
import {UserRepository} from "../../state/UserRepository";

export class UserService {

    private readonly client: UserClient;
    private readonly userRepository: UserRepository;

    constructor(client: UserClient, userRepository: UserRepository) {
        this.client = client;
        this.userRepository = userRepository;
    }

    public login(email: string, password: string): Promise<void> {
        return this.client.login(email, password)
            .then(data => this.userRepository.setAuthToken(data.idToken));
    }

    public signup(email: string, password: string, username: string): Promise<void> {
        return this.client.signUp(email, password, username);
    }

    public isAuthenticated(): boolean {
        const token = this.userRepository.getAuthTokenOrNull();
        if (token) {
            return this.getTokenExpiration(token) > Date.now();
        } else {
            return false;
        }
    }

    public getUserId(): string {
        return this.userIdFromToken(this.userRepository.getAuthTokenOrNull());
    }

    private getTokenExpiration(token: string): number {
        return this.expirationFromToken(token);
    }

    private expirationFromToken(token: string): number {
        return (jwt_decode(token) as any).exp * 1000;
    }

    private userIdFromToken(token: string | null): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}