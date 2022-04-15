package de.ruegnerlukas.strategygame.backend

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun main() {
	embeddedServer(Netty, port = 8080, host = "localhost") {
		install(Routing)
		configureRouting()
	}.start(wait = true)
}

fun Application.configureRouting() {
	routing {
		get("/") {
			call.respondRedirect("/hello/Unknown")
		}
		get("/hello/{name}") {
			call.respond(HttpStatusCode.OK, "Hello ${call.parameters["name"]}!")
		}
	}
}