import {createContext, useContext} from "react";

/**
 * Current user authentication state and available actions.
 */
export interface AuthState {
    isAuthenticated: boolean;
    userId: string | null;
    authToken: string | null;
}

/**
 * Current user authentication state and available actions.
 */
export interface AuthContextState extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

/**
 * Context managing current authentication state.
 */
export const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Hook providing access to current authentication state and functions.
 */
export function useAuth(): AuthContextState {
    const authState = useContext(AuthContext);
    if (!authState) {
        throw new Error("useAuth must be used within an AuthContext");
    }
    return authState;
}
