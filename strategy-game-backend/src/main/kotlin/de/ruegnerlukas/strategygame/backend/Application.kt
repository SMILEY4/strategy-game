package de.ruegnerlukas.strategygame.backend

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*

fun main() {
	embeddedServer(
		Netty,
		port = 8080,
		host = "localhost",
		watchPaths = listOf("classes")
	) {
		install(Routing)
		install(WebSockets)
		configureRouting()
	}.start(wait = true)
}

fun Application.configureRouting() {
	routing {
		get("/") {
			call.respondRedirect("/hello/World")
		}
		get("/hello/{name}") {
			call.respond(HttpStatusCode.OK, "Hello ${call.parameters["name"]}!")
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