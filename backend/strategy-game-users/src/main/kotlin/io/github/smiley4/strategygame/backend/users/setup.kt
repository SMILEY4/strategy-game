package io.github.smiley4.strategygame.backend.users

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.users.module.core.CreateUserImpl
import io.github.smiley4.strategygame.backend.users.module.core.DeleteUserImpl
import io.github.smiley4.strategygame.backend.users.module.core.LoginUserImpl
import io.github.smiley4.strategygame.backend.users.module.core.RefreshUserTokenImpl
import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions

fun Module.dependenciesUsers() {
    single<CreateUserImpl> { CreateUserImpl(get()) }
    single<DeleteUserImpl> { DeleteUserImpl(get()) }
    single<LoginUserImpl> { LoginUserImpl(get()) }
    single<RefreshUserTokenImpl> { RefreshUserTokenImpl(get()) }
    single<UserIdentityService> { UserIdentityService.createFromConfig(Config.get().identityService) } withOptions { createdAtStart() }
}