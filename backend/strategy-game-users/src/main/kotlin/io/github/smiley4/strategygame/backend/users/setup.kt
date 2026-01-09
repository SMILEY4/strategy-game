package io.github.smiley4.strategygame.backend.users

import io.github.smiley4.ktoropenapi.route
import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.common.UserIdentityServiceConfig
import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService
import io.github.smiley4.strategygame.backend.users.create.UserCreate
import io.github.smiley4.strategygame.backend.users.create.routeUserCreate
import io.github.smiley4.strategygame.backend.users.login.UserLogin
import io.github.smiley4.strategygame.backend.users.login.routeUserLogin
import io.github.smiley4.strategygame.backend.users.refreshtoken.UserRefreshToken
import io.github.smiley4.strategygame.backend.users.refreshtoken.routeUserRefreshToken
import io.ktor.server.routing.Route
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions

fun Module.dependenciesUsers() {

    single<UserIdentityServiceConfig> { Config.get().identityService }

    single<UserIdentityService> { UserIdentityService.createFromConfig(get()) }

    single<UserCreate> { UserCreate(get()) }
    single<UserLogin> { UserLogin(get()) }
    single<UserRefreshToken> { UserRefreshToken(get()) }
}

fun Route.routingUser() {
    route("user", {
        tags("user")
    }) {
        routeUserCreate()
        routeUserLogin()
        routeUserRefreshToken()
    }
}