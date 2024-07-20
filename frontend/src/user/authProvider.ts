import {UserRepository} from "./userRepository";

/**
 * Service prodding authentication information of the current user
 */
export class AuthProvider {

    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public getToken(): string | null {
        return this.userRepository.getAuthTokenOrNull();
    }

}