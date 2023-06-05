package de.ruegnerlukas.strategygame.backend.operation.external

import de.ruegnerlukas.strategygame.backend.common.logviewer.LogViewer
import io.github.smiley4.ktorswaggerui.dsl.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.html.respondHtml
import io.ktor.server.routing.Route

fun Route.routeLogs() = get("logs", {
    description = "Provides an embedded log-viwer."
    response {
        HttpStatusCode.OK to {
            body<String> {
                description = "The html of the log-viewer"
            }
        }
    }
}) {
    call.respondHtml(HttpStatusCode.OK) {
        LogViewer().build(this)
    }
}