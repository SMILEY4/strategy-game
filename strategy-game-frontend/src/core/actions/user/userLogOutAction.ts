import {UserStateAccess} from "../../../external/state/user/userStateAccess";

export class UserLogOutAction {

    private readonly userStateAccess: UserStateAccess;

    constructor(userStateAccess: UserStateAccess) {
        this.userStateAccess = userStateAccess;
    }

    perform(): void {
        console.debug("Logging Out")
        this.userStateAccess.clearAuth();
    }

}