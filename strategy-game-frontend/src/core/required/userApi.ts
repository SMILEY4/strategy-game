export interface UserApi {
    signUp: (email: string, password: string, username: string) => Promise<void>;
    login: (email: string, password: string) => Promise<string>;
    deleteUser: (email: string, password: string) => Promise<void>;
}