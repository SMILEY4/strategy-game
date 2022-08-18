package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.Json
import io.ktor.http.ContentType
import io.ktor.http.ContentType.Application.JavaScript
import io.ktor.http.ContentType.Image.PNG
import io.ktor.http.ContentType.Text.CSS
import io.ktor.http.ContentType.Text.Html
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.OutgoingContent
import io.ktor.http.withCharset
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.swagger.parser.OpenAPIParser
import io.swagger.v3.parser.core.models.SwaggerParseResult
import java.net.URL


/**
 * Main configuration for all routes
 */
fun Application.apiRoutes(
	connectionHandler: ConnectionHandler,
	messageHandler: MessageHandler,
	userIdentityService: UserIdentityService,
	gameCreateAction: GameCreateAction,
	gameJoinAction: GameJoinAction,
	gamesListAction: GamesListAction,
	gameDisconnectAction: GameDisconnectAction,
	gameRequestConnectionAction: GameRequestConnectionAction,
	gameConnectAction: GameConnectAction,
	gameConfig: GameConfig
) {
	routing {
		route("api") {
			userRoutes(userIdentityService)
			gameRoutes(gameCreateAction, gameJoinAction, gamesListAction, gameConfig)
			gameWebsocketRoutes(
				connectionHandler,
				userIdentityService,
				messageHandler,
				gameDisconnectAction,
				gameRequestConnectionAction,
				gameConnectAction
			)
			get("/health") {
				call.respond(HttpStatusCode.OK, "Healthy ${System.currentTimeMillis()}")
			}
			get("/swagger/{filename}") {
				val filename = call.parameters["filename"]
				if (filename == "swagger-initializer.js") {
					call.respondText(
						JavaScript,
						HttpStatusCode.OK
					) {
						"""
						window.onload = function() {
						  //<editor-fold desc="Changeable Configuration Block">

						  // the following lines will be replaced by docker/configurator, when it runs in a docker-container
						  window.ui = SwaggerUIBundle({
						    url: "http://localhost:8080/api/swagger/swagger.json",
						    dom_id: '#swagger-ui',
						    deepLinking: true,
						    presets: [
						      SwaggerUIBundle.presets.apis,
						      SwaggerUIStandalonePreset
						    ],
						    plugins: [
						      SwaggerUIBundle.plugins.DownloadUrl
						    ],
						    layout: "StandaloneLayout"
						  });

						  //</editor-fold>
						};
					""".trimIndent()
					}
				} else if (filename == "swagger.json") {
					val result: SwaggerParseResult = OpenAPIParser().readLocation("https://petstore3.swagger.io/api/v3/openapi.json", null, null)
					call.respondText(ContentType.Application.Json, HttpStatusCode.OK) {
						Json.asString(result.openAPI)
					}
				} else {
					val resource = this::class.java.getResource("/META-INF/resources/webjars/swagger-ui/4.13.2/$filename")
					if (resource == null) {
						call.respond(HttpStatusCode.NotFound, "$filename could not be found")
					} else {
						call.respond(ResourceContent(resource))
					}
				}
			}
		}
	}
}


private val contentTypes = mapOf(
	"html" to Html,
	"css" to CSS,
	"js" to JavaScript,
	"json" to ContentType.Application.Json.withCharset(Charsets.UTF_8),
	"png" to PNG
)


private class ResourceContent(val resource: URL) : OutgoingContent.ByteArrayContent() {
	private val bytes by lazy { resource.readBytes() }

	override val contentType: ContentType? by lazy {
		val extension = resource.file.substring(resource.file.lastIndexOf('.') + 1)
		contentTypes[extension] ?: Html
	}

	override val contentLength: Long? by lazy {
		bytes.size.toLong()
	}

	override fun bytes(): ByteArray = bytes
	override fun toString() = "ResourceContent \"$resource\""
}


/**
 * Get the id of the user making an (authenticated) http-request
 * @param call the request
 * @return the user id
 * */
fun getUserIdOrThrow(call: ApplicationCall): String {
	val principal = call.principal<JWTPrincipal>() ?: throw Exception("No JWT-Principal attached to call")
	return principal.payload.subject ?: throw Exception("No subject found in JWT-Principal")
}


/**
 * Get the id of the user opening an (authenticated) websocket-connection
 * @param call the request
 * @return the user id
 * */
fun getWebsocketUserIdOrThrow(userService: UserIdentityService, call: ApplicationCall): String {
	return userService.extractUserId(call.request.queryParameters[WebsocketUtils.QUERY_PARAM_TOKEN]!!)
}
