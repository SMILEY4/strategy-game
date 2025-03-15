import {UserService} from "../../logic/user/userService";
import {GotoHooks} from "./goto";

export namespace AuthHooks {

	export function useHandleUnauthorized() {
		const redirect = GotoHooks.useLoginRedirect("/login");
		return () => {
			redirect();
		};
	}

}

