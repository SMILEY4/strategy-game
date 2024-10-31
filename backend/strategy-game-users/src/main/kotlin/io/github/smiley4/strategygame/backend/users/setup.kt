package io.github.smiley4.strategygame.backend.users

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.UserIdentityServiceConfig
import io.github.smiley4.strategygame.backend.users.ports.provided.CreateUser
import io.github.smiley4.strategygame.backend.users.ports.provided.DeleteUser
import io.github.smiley4.strategygame.backend.users.ports.provided.LoginUser
import io.github.smiley4.strategygame.backend.users.ports.provided.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.application.core.CreateUserImpl
import io.github.smiley4.strategygame.backend.users.application.core.DeleteUserImpl
import io.github.smiley4.strategygame.backend.users.application.core.LoginUserImpl
import io.github.smiley4.strategygame.backend.users.application.core.RefreshUserTokenImpl
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions

fun Module.dependenciesUsers() {

    single<UserIdentityServiceConfig> { Config.get().identityService }

    single<CreateUser> { CreateUserImpl(get()) }
    single<DeleteUser> { DeleteUserImpl(get()) }
    single<LoginUser> { LoginUserImpl(get()) }
    single<RefreshUserToken> { RefreshUserTokenImpl(get()) }

    single<UserIdentityService> { UserIdentityService.createFromConfig(get()) } withOptions { createdAtStart() }

}