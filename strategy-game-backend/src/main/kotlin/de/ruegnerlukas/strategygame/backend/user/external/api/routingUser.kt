package de.ruegnerlukas.strategygame.backend.user.external.api

import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken
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