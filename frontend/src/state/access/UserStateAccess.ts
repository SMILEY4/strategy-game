import {LocalUserStore} from "../local/user/LocalUserStore";

export namespace UserStateAccess {

    export function setAuthToken(token: string | null) {
        LocalUserStore.updateState(state => ({
            ...state,
            token: token,
        }));
    }

    export function getAuthTokenOrNull(): string | null {
        return LocalUserStore.getState().token;
    }

}