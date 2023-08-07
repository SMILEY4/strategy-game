import {UserRepository} from "../required/userRepository";

/**
 * Log out
 */
export class UserLogOutAction {

    private readonly userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    perform(): void {
        console.debug("Logging Out");
        this.userRepository.clearAuth();
    }

}