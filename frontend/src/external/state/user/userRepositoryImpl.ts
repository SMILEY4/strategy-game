import {UserRepository} from "../../../core/required/userRepository";
import {optional} from "../../../shared/optional";
import {UserStore} from "./userStore";

export class UserRepositoryImpl implements UserRepository {

    isAuth(): boolean {
        return this.getAuthToken() !== null;
    }

    clearAuth(): void {
        UserStore.useState.getState().clearAuth();
    }

    setAuthToken(token: string): void {
        UserStore.useState.getState().setAuth(token);
    }

    getAuthToken(): string {
        return optional(UserStore.useState.getState().idToken)
            .getValueOrThrow("Not authenticated (no token set)");
    }

    getUserId(): string {
        return UserStore.userIdFromToken(this.getAuthToken());
    }

}