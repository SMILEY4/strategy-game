import type {UserClient} from "@app/features/user/user.client.ts";

export interface RegisterUseCase {
    execute: (username: string, password: string) => Promise<void>;
}

interface Dependencies {
    userClient: UserClient;
}

export const registerUseCase = ({userClient}: Dependencies): RegisterUseCase => ({
    execute: (username: string, password: string) => userClient.register(username, password),
});