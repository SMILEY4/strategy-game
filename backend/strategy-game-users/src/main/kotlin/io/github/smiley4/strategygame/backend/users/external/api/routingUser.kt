package io.github.smiley4.strategygame.backend.users.external.api

import io.github.smiley4.strategygame.backend.users.external.api.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.users.external.api.RouteLogin.routeLogin
import io.github.smiley4.strategygame.backend.users.external.api.RouteRefresh.routeRefresh
import io.github.smiley4.strategygame.backend.users.external.api.RouteSignup.routeSignup
import io.github.smiley4.strategygame.backend.users.ports.provided.CreateUser
import io.github.smiley4.strategygame.backend.users.ports.provided.DeleteUser
import io.github.smiley4.strategygame.backend.users.ports.provided.LoginUser
import io.github.smiley4.strategygame.backend.users.ports.provided.RefreshUserToken
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

fun Route.routingUser() {
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