package io.github.smiley4.strategygame.backend.users

import io.github.smiley4.strategygame.backend.common.Config
import io.github.smiley4.strategygame.backend.users.module.api.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.users.module.api.RouteLogin.routeLogin
import io.github.smiley4.strategygame.backend.users.module.api.RouteRefresh.routeRefresh
import io.github.smiley4.strategygame.backend.users.module.api.RouteSignup.routeSignup
import io.github.smiley4.strategygame.backend.users.module.core.CreateUser
import io.github.smiley4.strategygame.backend.users.module.core.DeleteUser
import io.github.smiley4.strategygame.backend.users.module.core.LoginUser
import io.github.smiley4.strategygame.backend.users.module.core.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.core.module.Module
import org.koin.core.module.dsl.createdAtStart
import org.koin.core.module.dsl.withOptions
import org.koin.ktor.ext.inject


fun Module.dependenciesUsers() {
    single<CreateUser> { CreateUser(get()) }
    single<DeleteUser> { DeleteUser(get()) }
    single<LoginUser> { LoginUser(get()) }
    single<RefreshUserToken> { RefreshUserToken(get()) }
    single<UserIdentityService> { UserIdentityService.createFromConfig(Config.get().identityService) } withOptions { createdAtStart() }
}

fun Route.routingUsers() {
    val userCreate by inject<CreateUser>()
    val userLogin by inject<LoginUser>()
    val userRefresh by inject<RefreshUserToken>()
    val userDelete by inject<DeleteUser>()
    route("user") {
        routeLogin(userLogin)
        routeRefresh(userRefresh)
        routeSignup(userCreate)
        authenticate("user") {
            routeDelete(userDelete)
        }
    }
}