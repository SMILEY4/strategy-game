package io.github.smiley4.strategygame.backend.sessions.disconnectall

import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import org.koin.ktor.ext.inject

fun Route.routeGameDisconnectAll(): Route {
    val gameDisconnectAll by inject<GameDisconnectAll>()
    return post("disconnect/all") {
        gameDisconnectAll.disconnect()
        call.respond(HttpStatusCode.OK)
    }
}