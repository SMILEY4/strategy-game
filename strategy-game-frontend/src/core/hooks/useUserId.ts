import {UserStore} from "../../external/state/user/userStore";
import {optional} from "../../shared/optional";

export function useUserIdOrNull(): string | null {
    return UserStore.useState(state => state.idToken);
}

export function useUserId(): string {
    return optional(useUserIdOrNull()).getValueOrThrow();
}
