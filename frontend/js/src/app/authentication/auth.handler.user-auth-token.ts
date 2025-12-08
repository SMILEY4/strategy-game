import {HttpRequestAuthHandler} from "../http/http.client";
import {authService} from "./auth.service";

export const authHandlerUserAuthToken: HttpRequestAuthHandler = {

    appendCredentials: false,

    async appendAuth(headers: Record<string, string>) {
        const authToken = authService.getAuthToken();
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }
    },

    onUnauthorized() {
        return false;
    },

    onUnhandledUnauthorized() {
        authService.clearStoredAuthData();
        window.location.href = "/login";
    },

};