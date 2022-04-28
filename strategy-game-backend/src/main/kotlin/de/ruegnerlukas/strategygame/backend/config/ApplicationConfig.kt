package de.ruegnerlukas.strategygame.backend.config

import de.ruegnerlukas.strategygame.backend.core.actions.CloseConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.CreateNewWorldActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.EndTurnAction
import de.ruegnerlukas.strategygame.backend.core.actions.JoinWorldActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.SubmitTurnActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.apiRoutes
import de.ruegnerlukas.strategygame.backend.external.persistence.RepositoryImpl
import de.ruegnerlukas.strategygame.backend.shared.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.shared.websocket.WebSocketMessageProducer
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.plugins.cors.CORS
import io.ktor.server.routing.Routing
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
	install(CORS) {
		allowMethod(HttpMethod.Options)
		allowMethod(HttpMethod.Put)
		allowMethod(HttpMethod.Delete)
		allowMethod(HttpMethod.Patch)
		allowHeader(HttpHeaders.Authorization)
		allowHeader(HttpHeaders.AccessControlAllowOrigin)
		allowHost("*", listOf("http", "https"))
		allowNonSimpleContentTypes = true
		allowCredentials = true
		allowSameOrigin = true
	}

	val connectionHandler = ConnectionHandler()
	val messageProducer = WebSocketMessageProducer(connectionHandler)
	val repository = RepositoryImpl()
	val endTurnAction = EndTurnAction(messageProducer, repository)
	val joinWorldAction = JoinWorldActionImpl(messageProducer, repository)
	val submitTurnAction = SubmitTurnActionImpl(repository, endTurnAction)
	val createWorldAction = CreateNewWorldActionImpl(repository)
	val closeConnectionAction = CloseConnectionActionImpl(repository, endTurnAction)
	val messageHandler = MessageHandler(joinWorldAction, submitTurnAction)

	apiRoutes(connectionHandler, messageHandler, createWorldAction, closeConnectionAction)
}