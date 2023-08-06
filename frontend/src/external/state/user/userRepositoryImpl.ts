import {UserRepository} from "../../../core/required/userRepository";
import {optional} from "../../../shared/optional";
import jwt_decode from "jwt-decode";

export class UserRepositoryImpl implements UserRepository {

    private static readonly KEY_AUTH_TOKEN = "auth-token"

    isAuth(): boolean {
        return this.getAuthTokenOrNull() !== null;
    }

    clearAuth(): void {
        localStorage.removeItem(UserRepositoryImpl.KEY_AUTH_TOKEN)
    }

    setAuthToken(token: string): void {
        localStorage.setItem(UserRepositoryImpl.KEY_AUTH_TOKEN, token)
    }

    getAuthToken(): string {
        return optional(this.getAuthTokenOrNull())
            .getValueOrThrow("Not authenticated (no token set)");
    }

    getAuthTokenOrNull(): string | null {
        return localStorage.getItem(UserRepositoryImpl.KEY_AUTH_TOKEN)
    }

    getUserId(): string {
        return this.userIdFromToken(this.getAuthToken());
    }

    private userIdFromToken(token: string): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}