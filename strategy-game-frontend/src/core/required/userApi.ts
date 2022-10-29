import {AuthData} from "../models/authData";

export interface UserApi {
    signUp: (email: string, password: string, username: string) => Promise<void>;
    login: (email: string, password: string) => Promise<AuthData>;
    deleteUser: (email: string, password: string) => Promise<void>;
}