import {useNavigate} from "react-router-dom";
import {useQuery} from "../components/headless/useQuery";
import {optional} from "../../shared/optional";
import {Base64} from "../../shared/base64";

export function useGotoLogin() {
    const navigate = useNavigate();
    return () => {
        navigate("/login");
    };
}

export function useGotoLoginRedirect(defaultUrl: string) {
    const navigate = useNavigate();
    const queryParams = useQuery()
    const redirectUrl = optional(Base64.decodeOrNull(queryParams.get("redirect"))).getValueOr(defaultUrl)
    return () => navigate(redirectUrl)
}

export function useGotoSignup() {
    const navigate = useNavigate();
    return () => {
        navigate("/signup")
    }
}

export function useGotoSignupConfirm() {
    const navigate = useNavigate();
    return () => {
        navigate("/signup/confirm")
    }
}
