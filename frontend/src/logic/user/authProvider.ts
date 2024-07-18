import {UserRepository} from "../../state/database/userRepository";

export class AuthProvider {

    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    public getToken(): string | null {
        return this.userRepository.getAuthTokenOrNull();
    }

}