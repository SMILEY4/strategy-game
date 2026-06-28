package io.github.smiley4.strategygame.application.plugins

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.calllogging.CallLogging
import io.ktor.server.plugins.cors.routing.CORS

/**
 * Configure call logging.
 */
fun Application.setupCallLogging() {
    install(CallLogging) {}
}
