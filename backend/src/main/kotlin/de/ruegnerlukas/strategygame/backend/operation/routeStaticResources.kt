package de.ruegnerlukas.strategygame.backend.operation

import io.ktor.server.http.content.resource
import io.ktor.server.http.content.static
import io.ktor.server.http.content.staticBasePackage
import io.ktor.server.routing.Route

fun Route.routeStaticResources() = static("/") {
    staticBasePackage = "logviewer"
    resource("jstable.css")
    resource("jstable.min.js")
}