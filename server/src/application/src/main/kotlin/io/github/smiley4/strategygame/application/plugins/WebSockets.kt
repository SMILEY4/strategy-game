package io.github.smiley4.strategygame.application.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.websocket.WebSockets


fun Application.setupWebSockets() {
    install(WebSockets)
}


