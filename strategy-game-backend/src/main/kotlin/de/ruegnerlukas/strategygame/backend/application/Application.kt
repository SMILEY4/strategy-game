package de.ruegnerlukas.strategygame.backend.application

import de.ruegnerlukas.strategygame.backend.core.service.TestService
import de.ruegnerlukas.strategygame.backend.external.api.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.persistence.TestRepositoryImpl
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.routing.Routing
import io.ktor.server.websocket.WebSockets
import org.slf4j.event.Level


fun main(args: Array<String>) {
	io.ktor.server.netty.EngineMain.main(args)
}


fun Application.module() {
	install(Routing)
	install(WebSockets)
	install(CallLogging) {
		level = Level.INFO
	}

	val testHandler = TestService(TestRepositoryImpl())

	apiRoutes(testHandler)
}