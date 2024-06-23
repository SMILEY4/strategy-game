package io.github.smiley4.strategygame.backend.gateway.users

import io.github.smiley4.strategygame.backend.gateway.users.RouteDelete.routeDelete
import io.github.smiley4.strategygame.backend.gateway.users.RouteLogin.routeLogin
import io.github.smiley4.strategygame.backend.gateway.users.RouteRefresh.routeRefresh
import io.github.smiley4.strategygame.backend.gateway.users.RouteSignup.routeSignup
import io.github.smiley4.strategygame.backend.users.edge.CreateUser
import io.github.smiley4.strategygame.backend.users.edge.DeleteUser
import io.github.smiley4.strategygame.backend.users.edge.LoginUser
import io.github.smiley4.strategygame.backend.users.edge.RefreshUserToken
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

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