package io.github.smiley4.strategygame.backend.gateway.websocket.routing

import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.gateway.websocket.routingconfig.WebsocketExtendedRouteConfig
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnection
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebsocketConnectionData
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.response.respond
import io.ktor.server.websocket.DefaultWebSocketServerSession
import io.ktor.websocket.Frame
import io.ktor.websocket.close
import io.ktor.websocket.readBytes
import io.ktor.websocket.readText
import mu.two.KotlinLogging

internal class WebsocketExtendedHandler(
    private val config: WebsocketExtendedRouteConfig,
    private val connectionHandler: WebSocketConnectionHandler
) {

    private val logger = KotlinLogging.logger(WebsocketExtendedHandler::class.java.name)

    /**
     * handle the websocket-connection before any message
     */
    suspend fun handleBefore(ticketManager: WebsocketTicketAuthManager?, call: ApplicationCall, authenticate: Boolean): WebsocketConnectionData? {
        if (!authenticate) {
            config.onConnectHandler(call, null)
            return null
        } else {
            if(ticketManager == null) {
                throw IllegalArgumentException(WebsocketTicketAuthManager::class.simpleName + " must be provided when using authentication.")
            }
            val ticket = config.tickerProvider(call)
            if (ticket == null || !ticketManager.validateAndConsumeTicket(ticket)) {
                call.respond(HttpStatusCode.Unauthorized)
                return null
            } else {
                return ticketManager.extractData(ticket).also {
                    config.onConnectHandler(call, it)
                }
            }
        }
    }

    /**
     * handle the open websocket-connection
     */
    suspend fun handleSession(session: DefaultWebSocketServerSession, data: WebsocketConnectionData) {
        val connection = connectionHandler.open(session, data)
        try {
            config.onOpenHandler(connection)
            for (frame in session.incoming) {
                handleFrame(connection, frame)
            }
        } catch (e: Exception) {
            logger.error(e) { "Error while handling websocket connection" }
        } finally {
            config.onCloseHandler(connection)
            connectionHandler.close(connection)
            connection.session.close()
        }
    }

    /**
     * handle the given message/frame from the given connection
     */
    private suspend fun handleFrame(connection: WebSocketConnection, frame: Frame) {
        when (frame) {
            is Frame.Text -> {
                config.textConfig?.onEachHandler?.let {
                    it(connection, frame.readText())
                }
            }
            is Frame.Binary -> {
                config.binaryConfig?.onEachHandler?.let {
                    it(connection, frame.readBytes())
                }
            }
            else -> logger.warn("Unhandled websocket frame-type: ${frame.frameType}")
        }
    }

}