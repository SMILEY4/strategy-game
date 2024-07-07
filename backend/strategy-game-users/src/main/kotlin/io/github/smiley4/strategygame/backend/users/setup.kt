package io.github.smiley4.strategygame.backend.users

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.UserIdentityServiceConfig
import io.github.smiley4.strategygame.backend.users.edge.CreateUser
import io.github.smiley4.strategygame.backend.users.edge.DeleteUser
import io.github.smiley4.strategygame.backend.users.edge.LoginUser
import io.github.smiley4.strategygame.backend.users.edge.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.module.core.CreateUserImpl
import io.github.smiley4.strategygame.backend.users.module.core.DeleteUserImpl
import io.github.smiley4.strategygame.backend.users.module.core.LoginUserImpl
import io.github.smiley4.strategygame.backend.users.module.core.RefreshUserTokenImpl
import io.github.smiley4.strategygame.backend.users.edge.UserIdentityService
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