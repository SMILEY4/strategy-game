package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.CreateUserData
import de.ruegnerlukas.strategygame.backend.ports.models.auth.LoginData
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.CodeDeliveryError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.InvalidEmailOrPasswordError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.NotAuthorizedError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.UserAlreadyExistsError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.UserNotConfirmedError
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService.UserNotFoundError
import de.ruegnerlukas.strategygame.backend.shared.traceId
import io.github.smiley4.ktorswaggerui.documentation.delete
import io.github.smiley4.ktorswaggerui.documentation.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import mu.withLoggingContext


/**
 * configuration for user-routes
 */
fun Route.userRoutes(userIdentityService: UserIdentityService) {
    route("user") {
        post("signup", {
            description = "Create a new user"
            request {
                body(CreateUserData::class)
            }
            response {
                HttpStatusCode.OK to { description = "Successfully created user" }
                HttpStatusCode.Conflict to { description = "Could not deliver code to provided email" }
                HttpStatusCode.Conflict to { description = "Email or password invalid" }
                HttpStatusCode.Conflict to { description = "The user with the given email already exists" }
            }
        }) {
            withLoggingContext(traceId()) {
                call.receive<CreateUserData>().let { requestData ->
                    val result = userIdentityService.createUser(requestData.email, requestData.password, requestData.username)
                    when (result) {
                        is Either.Right -> call.respond(HttpStatusCode.OK, result.value)
                        is Either.Left -> when (result.value) {
                            CodeDeliveryError -> call.respond(HttpStatusCode.Conflict, result.value)
                            InvalidEmailOrPasswordError -> call.respond(HttpStatusCode.Conflict, result.value)
                            UserAlreadyExistsError -> call.respond(HttpStatusCode.Conflict, result.value)
                        }
                    }
                }
            }
        }
        post("login", {
            description = "Log-in as an existing user"
            request {
                body(LoginData::class)
            }
            response {
                HttpStatusCode.OK to {
                    description = "Authentication successful"
                    body(AuthData::class)
                }
                HttpStatusCode.Unauthorized to { description = "Authentication failed" }
                HttpStatusCode.Conflict to { description = "The user has not confirmed the code" }
                HttpStatusCode.Conflict to { description = "The user does not exist" }
            }
        }) {
            withLoggingContext(traceId()) {
                call.receive<LoginData>().let { requestData ->
                    val result = userIdentityService.authenticate(requestData.email, requestData.password)
                    when (result) {
                        is Either.Right -> call.respond(HttpStatusCode.OK, AuthData(result.value))
                        is Either.Left -> when (result.value) {
                            NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, result.value)
                            UserNotConfirmedError -> call.respond(HttpStatusCode.Conflict, result.value)
                            UserNotFoundError -> call.respond(HttpStatusCode.NotFound, result.value)
                        }
                    }
                }
            }
        }
        post("refresh", {
            description = "Get a new token without sending the users credentials again"
            request {
                body(String::class)
            }
            response {
                HttpStatusCode.OK to {
                    description = "Authentication successful"
                    body(AuthData::class)
                }
                HttpStatusCode.Unauthorized to { description = "Authentication failed (refresh token invalid)" }
                HttpStatusCode.NotFound to { description = "User does not exist" }
                HttpStatusCode.Conflict to { description = "The user is not confirmed" }
            }
        }) {
            withLoggingContext(traceId()) {
                call.receive<String>().let { requestData ->
                    val result = userIdentityService.refreshAuthentication(requestData)
                    when (result) {
                        is Either.Right -> call.respond(HttpStatusCode.OK, result.value)
                        is Either.Left -> when (result.value) {
                            NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, result.value)
                            UserNotConfirmedError -> call.respond(HttpStatusCode.Conflict, result.value)
                            UserNotFoundError -> call.respond(HttpStatusCode.NotFound, result.value)
                        }
                    }
                }
            }
        }
        authenticate {
            delete("delete", {
                description = "Delete the given user. Email and password must be send again, even though the user is already \"logged in\""
                request {
                    body(LoginData::class)
                }
                response {
                    HttpStatusCode.OK to { description = "User was deleted" }
                    HttpStatusCode.Unauthorized to { description = "Authentication failed (token, email or password invalid)" }
                }
            }) {
                withLoggingContext(traceId()) {
                    call.receive<LoginData>().let { requestData ->
                        val result = userIdentityService.deleteUser(requestData.email, requestData.password)
                        when (result) {
                            is Either.Right -> call.respond(HttpStatusCode.OK, result.value)
                            is Either.Left -> when (result.value) {
                                NotAuthorizedError -> call.respond(HttpStatusCode.Unauthorized, result.value)
                            }
                        }
                    }
                }
            }
        }
    }
}