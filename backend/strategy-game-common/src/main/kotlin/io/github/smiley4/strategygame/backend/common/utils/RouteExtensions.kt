package io.github.smiley4.strategygame.backend.common.utils

import io.ktor.server.routing.PathSegmentConstantRouteSelector
import io.ktor.server.routing.PathSegmentParameterRouteSelector
import io.ktor.server.routing.RootRouteSelector
import io.ktor.server.routing.Route

fun Route.toDisplayString(): String {
    var strRoute = ""

    var current: Route? = this
    while (current != null) {
        when (current.selector) {
            is PathSegmentConstantRouteSelector -> {
                strRoute = if (strRoute.isEmpty()) {
                    (current.selector as PathSegmentConstantRouteSelector).value
                } else {
                    "${(current.selector as PathSegmentConstantRouteSelector).value}/$strRoute"
                }
            }
            is PathSegmentParameterRouteSelector -> {
                strRoute = if (strRoute.isEmpty()) {
                    (current.selector as PathSegmentParameterRouteSelector).name
                } else {
                    "{${(current.selector as PathSegmentParameterRouteSelector).name}}/$strRoute"
                }
            }
            is RootRouteSelector -> {
                strRoute = if (strRoute.isEmpty()) {
                    "/"
                } else {
                    "/$strRoute"
                }
            }
        }
        current = current.parent
    }

    return strRoute
}