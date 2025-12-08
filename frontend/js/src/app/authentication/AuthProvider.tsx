import {type ReactElement, type ReactNode, useState} from "react";
import {AuthContext, AuthState} from "./AuthContext";
import {authService} from "./auth.service";

/**
 * Provider for the current authentication context.
 */
export function AuthProvider(props: { children: ReactNode }): ReactElement {

    const [authState, setAuthState] = useState<AuthState>(getAuthState());

    function getEmptyAuthState(): AuthState {
        return {
            isAuthenticated: false,
            userId: null,
            authToken: null
        }
    }

    function getAuthState(): AuthState {
        return {
            isAuthenticated: authService.isAuthenticated(),
            userId: authService.getUserId(),
            authToken: authService.getAuthToken(),
        };
    }

    function handleLogin(username: string, password: string): Promise<void> {
        return authService
            .login(username, password)
            .then(() => {
                setAuthState(getAuthState());
            })
            .catch(e => {
                setAuthState(getEmptyAuthState());
                throw e;
            });
    }

    function handleLogout(): void {
        authService.clearStoredAuthData();
        setAuthState(getAuthState());
    }

    return (
        <AuthContext.Provider value={{
            ...authState,
            login: handleLogin,
            logout: handleLogout,
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}
