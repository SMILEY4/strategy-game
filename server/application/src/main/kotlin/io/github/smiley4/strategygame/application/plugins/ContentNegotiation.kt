package io.github.smiley4.strategygame.application.plugins

import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import kotlinx.serialization.json.Json

fun Application.setupContentNegotiation(): Json {

    val json = Json {
        prettyPrint = true
        isLenient = true
    }

    install(ContentNegotiation) {
        json(json)
    }

    return json
}