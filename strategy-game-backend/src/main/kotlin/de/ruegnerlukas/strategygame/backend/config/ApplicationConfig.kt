package de.ruegnerlukas.strategygame.backend.config

import de.ruegnerlukas.strategygame.backend.core.service.test.TestServiceImpl
import de.ruegnerlukas.strategygame.backend.core.service.world.WorldMessageHandlerImpl
import de.ruegnerlukas.strategygame.backend.core.service.world.WorldServiceImpl
import de.ruegnerlukas.strategygame.backend.external.api.WorldMessageDispatcher
import de.ruegnerlukas.strategygame.backend.external.api.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.api.wscore.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.wscore.WebSocketMessageProducer
import de.ruegnerlukas.strategygame.backend.external.persistence.TestRepositoryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldRepositoryImpl
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.routing.Routing
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.pingPeriod
import io.ktor.server.websocket.timeout
import kotlinx.serialization.json.Json
import org.slf4j.event.Level
import java.time.Duration

/**
 * The main-module for configuring Ktor. Referenced in "application.conf".
 */
fun Application.module() {
	install(Routing)
	install(WebSockets) {
		pingPeriod = Duration.ofSeconds(15)
		timeout = Duration.ofSeconds(15)
		maxFrameSize = Long.MAX_VALUE
		masking = false
	}
	install(CallLogging) {
		level = Level.INFO
	}
	install(ContentNegotiation) {
		json(Json {
			prettyPrint = true
		})
	}

	val connectionHandler = ConnectionHandler()
	val messageProducer = WebSocketMessageProducer(connectionHandler)
	val testHandler = TestServiceImpl(TestRepositoryImpl())
	val worldService = WorldServiceImpl(WorldRepositoryImpl())
	val worldMessageHandler = WorldMessageHandlerImpl(messageProducer, worldService)
	val worldMessageDispatcher = WorldMessageDispatcher(worldMessageHandler)

	apiRoutes(connectionHandler, testHandler, worldService, worldMessageDispatcher)
}