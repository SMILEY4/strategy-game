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


namespace LocalUserStore {

    const KEY_AUTH_TOKEN = "auth-token";

    export interface State {
        token: string | null,
    }

    export function getState(): State {
        return {
            token: localStorage.getItem(KEY_AUTH_TOKEN),
        };
    }

    export function updateState(action: (prevState: State) => State) {
        setState(action(getState()))
    }

    export function setState(state: State) {
        if (state.token) {
            localStorage.setItem(KEY_AUTH_TOKEN, state.token);
        } else {
            localStorage.removeItem(KEY_AUTH_TOKEN);
        }
    }

}