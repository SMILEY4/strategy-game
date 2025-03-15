/**
 * Service prodding authentication information of the current user
 */
export class AuthProvider {

    public getToken(): string | null {
        return this.userRepository.getAuthTokenOrNull();
    }

}