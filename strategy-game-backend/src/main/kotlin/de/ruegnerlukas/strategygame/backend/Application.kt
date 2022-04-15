package de.ruegnerlukas.strategygame.backend

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.callloging.CallLogging
import io.ktor.server.response.respond
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.Routing
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.CloseReason
import io.ktor.websocket.Frame
import io.ktor.websocket.close
import io.ktor.websocket.readText
import org.slf4j.event.Level


class MyClass : Logging {
	init {
		log().info("Hello Log")
	}
}

fun main() {
	embeddedServer(
		Netty,
		port = 8080,
		host = "localhost",
		watchPaths = listOf("classes")
	) {
		install(Routing)
		install(WebSockets)
		install(CallLogging) {
			level = Level.INFO
		}
		configureRouting()
	}.start(wait = true)
}


fun Application.configureRouting() {
	routing {
		get("/") {
			call.respondRedirect("/hello/World", true)
		}
		get("/hello/{name}") {
			call.respond(HttpStatusCode.OK, "Hello ${call.parameters["name"]}!")
			MyClass()
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