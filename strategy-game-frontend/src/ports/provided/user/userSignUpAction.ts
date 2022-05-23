export interface UserSignUpAction {
    perform: (email: string, password: string, username: string) => Promise<void>
}