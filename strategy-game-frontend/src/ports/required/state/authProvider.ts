export interface AuthProvider {
    isAuthenticated: () => boolean
    getToken: () => string
}