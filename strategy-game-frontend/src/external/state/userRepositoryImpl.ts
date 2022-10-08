import {UserRepository} from "../../core/required/userRepository";
import {UserStateAccess} from "./user/userStateAccess";

export class UserRepositoryImpl implements UserRepository {

    private readonly userStateAccess: UserStateAccess;

    constructor(userStateAccess: UserStateAccess) {
        this.userStateAccess = userStateAccess;
    }


    isAuth(): boolean {
        return this.getAuthToken() !== null;
    }


    clearAuth(): void {
        this.userStateAccess.clearAuth();
    }


    setAuthToken(token: string): void {
        this.userStateAccess.setAuth(token);
    }


    getAuthToken(): string {
        const token = this.userStateAccess.getToken();
        if (token) {
            return token;
        } else {
            throw new Error("Not authenticated");
        }
    }


    getUserId(): string {
        const userId = this.userStateAccess.getUserId();
        if (userId) {
            return userId;
        } else {
            throw new Error("Not authenticated");
        }
    }

}