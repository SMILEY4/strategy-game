import {UserStore} from "../../external/state/user/userStore";
import {optional} from "../../shared/optional";

export function useUserIdOrNull(): string | null {
    return optional(UserStore.useState(state => state.idToken))
        .map(token => UserStore.userIdFromToken(token))
        .getValue()
}

export function useUserId(): string {
    return optional(useUserIdOrNull()).getValueOrThrow();
}
