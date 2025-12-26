package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.ktoropenapi.OpenApi
import io.github.smiley4.ktoropenapi.config.AuthKeyLocation
import io.github.smiley4.ktoropenapi.config.AuthScheme
import io.github.smiley4.ktoropenapi.config.AuthType
import io.github.smiley4.ktoropenapi.config.ExampleEncoder
import io.github.smiley4.ktoropenapi.config.SchemaGenerator
import io.ktor.server.application.Application
import io.ktor.server.application.install
import kotlinx.serialization.json.Json

/**
 * Configure openapi specification.
 */
fun Application.setupOpenApi(json: Json) {
    install(OpenApi) {
        info {
            title = "Group Vacation Planner API"
            version = "indev"
        }
        security {
            securityScheme(AUTH_KEY_USER) {
                type = AuthType.HTTP
                scheme = AuthScheme.BEARER
                bearerFormat = "jwt"
                location = AuthKeyLocation.HEADER
            }
            securityScheme(AUTH_KEY_TECHNICAL) {
                type = AuthType.HTTP
                scheme = AuthScheme.BASIC
            }
        }
        schemas {
            generator = SchemaGenerator.kotlinx(json)
        }
        examples {
            encoder(ExampleEncoder.kotlinx(json))
        }
    }
}
