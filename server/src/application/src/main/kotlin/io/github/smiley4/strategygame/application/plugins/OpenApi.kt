package io.github.smiley4.strategygame.application.plugins

import io.github.smiley4.ktoropenapi.OpenApi
import io.github.smiley4.ktoropenapi.config.ExampleEncoder
import io.github.smiley4.ktoropenapi.config.SchemaGenerator
import io.github.smiley4.ktoropenapi.openApi
import io.github.smiley4.ktorswaggerui.swaggerUI
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import kotlinx.serialization.json.Json

fun Application.setupOpenApi(json: Json) {
    install(OpenApi) {
        info {
            title = "Strategy Game API"
            version = "indev"
        }
        schemas {
            generator = SchemaGenerator.kotlinx(json)
        }
        examples {
            encoder(ExampleEncoder.kotlinx(json))
        }
    }
}

fun Route.routingOpenApi() {
    // todo: authenticate ?
    route("api.json") {
        openApi()
    }
    route("swagger") {
        swaggerUI("/api/api.json")
    }
}
