import {UserRepository} from "./userRepository";
import {UserClient} from "./userClient";

export class UserService {

    private readonly repository: UserRepository;
    private readonly client: UserClient;

    constructor(repository: UserRepository, client: UserClient) {
        this.repository = repository;
        this.client = client;
    }


    isAuthenticated(): boolean {
        return this.repository.isAuthenticated();
    }

    login(email: string, password: string): Promise<void> {
        return this.client.login(email, password)
            .then(data => this.repository.setAuthToken(data.idToken));
    }

    signup(email: string, password: string, username: string): Promise<void> {
        return this.client.signUp(email, password, username);
    }

}