package io.github.smiley4.strategygame.backend.app

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.github.smiley4.strategygame.backend.gateway.sessions.models.GameSessionDto
import io.github.smiley4.strategygame.backend.users.ports.AuthData
import io.github.smiley4.strategygame.backend.users.ports.LoginData
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.websocket.WebSockets
import io.ktor.client.plugins.websocket.webSocket
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.contentType
import io.ktor.serialization.jackson.jackson
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import io.ktor.websocket.send

suspend fun main() {

    val json = jacksonObjectMapper()

    val client = HttpClient(CIO) {
        install(WebSockets)
        install(ContentNegotiation) {
            jackson()
        }
    }

    // get token
    val authData = client
        .post("http://localhost:8080/api/user/login") {
            contentType(ContentType.Application.Json)
            setBody(
                LoginData(
                    email = "simulation-user",
                    password = "simulation-password"
                )
            )
        }
        .body<AuthData>()

    // get all games
    val games = client
        .get("http://localhost:8080/api/session/list") {
            header(HttpHeaders.Authorization, "Bearer ${authData.idToken}")
        }
        .body<List<GameSessionDto>>()

    // delete/cleanup old games
    games.forEach { game ->
        client.delete("http://localhost:8080/api/session/delete/${game.id}") {
            header(HttpHeaders.Authorization, "Bearer ${authData.idToken}")
        }
    }

    // create (and join) new game
    val createdGameId = client
        .post("http://localhost:8080/api/session/create?name=simulatedgame") {
            header(HttpHeaders.Authorization, "Bearer ${authData.idToken}")
        }
        .bodyAsText()
        .replace("\"", "")

    // get new websocket auth ticket
    val wsTicket = client
        .get("http://localhost:8080/api/session/wsticket") {
            header(HttpHeaders.Authorization, "Bearer ${authData.idToken}")
        }
        .bodyAsText()
        .replace("\"", "")

    // connect to game and send/receive messages
    client.webSocket("ws://localhost:8080/api/session/connect/${createdGameId}?ticket=$wsTicket") {

        val frame0 = incoming.receive()
        if(frame0 is Frame.Text) {
            println("Server says: ${frame0.readText()}")
        }

    }

}