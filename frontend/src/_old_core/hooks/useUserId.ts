import {AppConfig} from "../../main";

export function useUserIdOrNull(): string | null {
    const repository = AppConfig.di.get(AppConfig.DIQ.UserRepository);
    return repository.getUserIdOrNull()
}
