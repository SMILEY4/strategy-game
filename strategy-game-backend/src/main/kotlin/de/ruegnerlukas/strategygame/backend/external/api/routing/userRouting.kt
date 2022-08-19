package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.lruegner.ktorswaggerui.documentation.delete
import de.lruegner.ktorswaggerui.documentation.post
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
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.route


/**
 * configuration for user-routes
 */
fun Route.userRoutes(userIdentityService: UserIdentityService) {
    route("user") {
        post("signup", {
            description = "Create a new user"
            requestBody(CreateUserData::class.java)
            response(HttpStatusCode.OK, "Successfully created user")
            response(HttpStatusCode.Conflict, "Could not deliver code to provided email")
            response(HttpStatusCode.Conflict, "Email or password invalid")
            response(HttpStatusCode.Conflict, "The user with the given email already exists")
        }) {
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
        post("login", {
            description = "Log-in as an existing user"
            requestBody(LoginData::class.java)
            response(HttpStatusCode.OK, "Authentication successful", AuthData::class.java)
            response(HttpStatusCode.Unauthorized, "Authentication failed")
            response(HttpStatusCode.Conflict, "The user has not confirmed the code")
            response(HttpStatusCode.Conflict, "The user does not exist")
        }) {
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
        post("refresh", {
            description = "Get a new token without sending the users credentials again"
            requestBodyPlainText()
            response(HttpStatusCode.OK, "Authentication successful", AuthData::class.java)
            response(HttpStatusCode.Unauthorized, "Authentication failed (refresh token invalid)")
            response(HttpStatusCode.NotFound, "User does not exist")
            response(HttpStatusCode.Conflict, "The user is not confirmed")
        }) {
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
        authenticate {
            delete("delete", {
                description = "Delete the given user. Email and password must be send again, even though the user is already \"logged in\""
                requestBody(LoginData::class.java)
                response(HttpStatusCode.OK, "User was deleted")
                response(HttpStatusCode.Unauthorized, "Authentication failed (token, email or password invalid)")
            }) {
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