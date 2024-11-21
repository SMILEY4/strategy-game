import {useNavigate} from "react-router-dom";
import {useQuery} from "../components/headless/useQuery";
import {optional} from "../../common/optional";
import {Base64} from "../../common/base64";

export namespace GotoHooks {

	export function useLogin() {
		const navigate = useNavigate();
		return () => {
			navigate("/login");
		};
	}

	export function useLoginRedirect(defaultUrl: string) {
		const navigate = useNavigate();
		const queryParams = useQuery();
		const redirectUrl = optional(Base64.decodeOrNull(queryParams.get("redirect"))).getValueOr(defaultUrl);
		return () => navigate(redirectUrl);
	}

	export function useSignup() {
		const navigate = useNavigate();
		return () => {
			navigate("/signup");
		};
	}

	export function useSignupConfirm() {
		const navigate = useNavigate();
		return () => {
			navigate("/signup/confirm");
		};
	}

}

