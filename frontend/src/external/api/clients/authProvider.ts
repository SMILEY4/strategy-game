import {UserRepository} from "../../../core/required/userRepository";

export class AuthProvider {

    private readonly userRepository: UserRepository;


    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    getToken(): string | null {
        return this.userRepository.getAuthTokenOrNull();
    }

}