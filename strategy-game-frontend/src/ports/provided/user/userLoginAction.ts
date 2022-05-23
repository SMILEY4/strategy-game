import {AuthData} from "../../models/authData";

export interface UserLoginAction {
    perform: (email: string, password: string) => Promise<void>
}