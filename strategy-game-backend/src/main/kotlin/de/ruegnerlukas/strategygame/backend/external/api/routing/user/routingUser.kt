package de.ruegnerlukas.strategygame.backend.external.api.routing.user

import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserLoginAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserRefreshTokenAction
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

fun Route.routingUser() {
    val userCreate by inject<UserCreateAction>()
    val userLogin by inject<UserLoginAction>()
    val userRefresh by inject<UserRefreshTokenAction>()
    val userDelete by inject<UserDeleteAction>()
    route("user") {
        routeLogin(userLogin)
        routeRefresh(userRefresh)
        routeSignup(userCreate)
        authenticate("user") {
            routeDelete(userDelete)
        }
    }
}