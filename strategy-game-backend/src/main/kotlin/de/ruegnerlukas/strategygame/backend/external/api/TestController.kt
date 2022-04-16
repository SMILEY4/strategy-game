package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestHandler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.CloseReason
import io.ktor.websocket.Frame
import io.ktor.websocket.close
import io.ktor.websocket.readText

fun Route.testRoutes(testHandler: TestHandler) {
	route("test") {
		get("hello/{name}") {
			val response = testHandler.sayHello(call.parameters["name"].toString())
			call.respond(HttpStatusCode.OK, response)
		}
		webSocket("/echo") {
			send(Frame.Text("Please enter your name"))
			for (frame in incoming) {
				when (frame) {
					is Frame.Text -> {
						val received = frame.readText()
						println("Received: $received")
						if (received.equals("bye", ignoreCase = true)) {
							close(CloseReason(CloseReason.Codes.NORMAL, "Client said bye"))
						} else {
							send(Frame.Text("Hi, $received"))
						}
					}
					else -> print("Unknown frame-type: $frame")
				}
			}
		}
	}
}