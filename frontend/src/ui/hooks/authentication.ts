import {useDI} from "../../appContext";
import {UserService} from "../../logic/user/userService";
import {GotoHooks} from "./goto";

export namespace AuthHooks {

	export function useAuthenticated() {
		const userService = useDI<UserService>(UserService.name);
		return userService.isAuthenticated();
	}

	export function useHandleUnauthorized() {
		const redirect = GotoHooks.useLoginRedirect("/login");
		return () => {
			redirect();
		};
	}

}

