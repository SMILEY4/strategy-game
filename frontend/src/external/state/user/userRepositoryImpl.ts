import {UserRepository} from "../../../core/required/userRepository";
import {optional} from "../../../shared/optional";
import jwt_decode from "jwt-decode";

export class UserRepositoryImpl implements UserRepository {

    private static readonly KEY_AUTH_TOKEN = "auth-token";

    isAuth(): boolean {
        const token = this.getAuthTokenOrNull();
        if (token) {
            return this.getTokenExpiration() > Date.now();
        } else {
            return false;
        }
    }

    clearAuth(): void {
        localStorage.removeItem(UserRepositoryImpl.KEY_AUTH_TOKEN);
    }

    setAuthToken(token: string): void {
        localStorage.setItem(UserRepositoryImpl.KEY_AUTH_TOKEN, token);
    }

    getAuthToken(): string {
        return optional(this.getAuthTokenOrNull())
            .getValueOrThrow("Not authenticated (no token set)");
    }

    getAuthTokenOrNull(): string | null {
        return localStorage.getItem(UserRepositoryImpl.KEY_AUTH_TOKEN);
    }

    getUserId(): string {
        return this.userIdFromToken(this.getAuthToken());
    }

    getUserIdOrNull(): string | null {
        const token = this.getAuthTokenOrNull();
        if (token) {
            return this.userIdFromToken(token);
        } else {
            return null;
        }
    }

    getTokenExpiration(): number {
        return this.expirationFromToken(this.getAuthTokenOrNull());
    }

    private expirationFromToken(token: string | null): number {
        if (token) {
            return (jwt_decode(token) as any).exp * 1000;
        } else {
            return 0;
        }
    }

    private userIdFromToken(token: string | null): string {
        if (token) {
            return (jwt_decode(token) as any).sub;
        } else {
            return "";
        }
    }

}