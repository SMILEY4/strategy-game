import {UserLogOutAction} from "../../../ports/provided/user/userLogOutAction";
import {UserStateAccess} from "../../../ports/required/state/userStateAccess";

export class UserLogOutActionImpl implements UserLogOutAction {

    private readonly userStateAccess: UserStateAccess;

    constructor(userStateAccess: UserStateAccess) {
        this.userStateAccess = userStateAccess;
    }

    perform(): void {
        console.debug("Logging Out")
        this.userStateAccess.clearAuth();
    }

}