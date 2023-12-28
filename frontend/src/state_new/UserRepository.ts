import {LocalUserStore} from "./LocalUserStore";

export class UserRepository {

    public setAuthToken(token: string | null) {
        LocalUserStore.updateState(state => ({
            ...state,
            token: token,
        }));
    }

    public getAuthTokenOrNull(): string | null {
        return LocalUserStore.getState().token;
    }

}