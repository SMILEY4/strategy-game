import type {AuthRepository} from "@app/features/auth/auth-repository.ts";

export interface LogInUseCase {
    execute: (username: string, password: string) => Promise<void>;
}

interface Dependencies {
    repository: AuthRepository;
}

export const logInUseCase = ({repository}: Dependencies): LogInUseCase => ({
    execute: (username: string, password: string) => repository.logIn(username, password),
});