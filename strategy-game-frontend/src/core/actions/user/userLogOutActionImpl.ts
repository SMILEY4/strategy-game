import {UserLogOutAction} from "../../../ports/provided/user/UserLogOutAction";
import {UserStateAccess} from "../../../ports/required/state/userStateAccess";

export class UserLogOutActionImpl implements UserLogOutAction {

    private readonly userStateAccess: UserStateAccess;

    constructor(userStateAccess: UserStateAccess) {
        this.userStateAccess = userStateAccess;
    }

    perform(): void {
        this.userStateAccess.clearAuth();
    }

}