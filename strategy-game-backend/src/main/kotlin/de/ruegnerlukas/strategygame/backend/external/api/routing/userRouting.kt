package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateUserData
import de.ruegnerlukas.strategygame.backend.ports.models.LoginData
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserLoginAction
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserRefreshTokenAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.delete
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject


/**
 * configuration for user-routes
 */
fun Route.userRoutes() {

    val userCreate by inject<UserCreateAction>()
    val userLogin by inject<UserLoginAction>()
    val userRefresh by inject<UserRefreshTokenAction>()
    val userDelete by inject<UserDeleteAction>()

    route("user") {
        post("signup", {
            description = "Create a new user"
            request {
                body(CreateUserData::class)
            }
            response {
                HttpStatusCode.OK to {
                    description = "Successfully accepted the signup-request."
                }
                HttpStatusCode.Conflict to {
                    description = "Error during signup."
                    body(ApiResponse::class) {
                        example("CodeDeliveryError", ApiResponse.failure(UserIdentityService.CodeDeliveryError)) {
                            description = "Verification code could not be delivered to provided email."
                        }
                        example("InvalidEmailOrPasswordError", ApiResponse.failure(UserIdentityService.InvalidEmailOrPasswordError)) {
                            description = "Provided email or password is invalid."
                        }
                        example("UserAlreadyExistsError", ApiResponse.failure(UserIdentityService.UserAlreadyExistsError)) {
                            description = "User with the given email already exists."
                        }
                    }
                }
            }
        }) {
            withLoggingContextAsync(mdcTraceId()) {
                call.receive<CreateUserData>().let { requestData ->
                    when (val result = userCreate.perform(requestData.email, requestData.password, requestData.username)) {
                        is Either.Right -> ApiResponse.respondSuccess(call)
                        is Either.Left -> ApiResponse.respondFailure(call, result.value)
                    }
                }
            }
        }
        post("login", {
            description = "Log-in as an existing user, i.e. request a new authentication token."
            request {
                body(LoginData::class)
            }
            response {
                HttpStatusCode.OK to {
                    description = "Authentication successful"
                    body(AuthData::class)
                }
                HttpStatusCode.Unauthorized to {
                    description = "Authentication failed"
                    body(ApiResponse::class) {
                        example("Unauthorized", ApiResponse.authenticationFailed()) {
                            description = "The provided email or password is invalid."
                        }
                    }
                }
                HttpStatusCode.Conflict to {
                    description = "Error during authentication."
                    body(ApiResponse::class) {
                        example("UserNotConfirmedError", ApiResponse.failure(UserIdentityService.UserNotConfirmedError)) {
                            description = " The user has not confirmed the code"
                        }
                        example("UserNotFoundError", ApiResponse.failure(UserIdentityService.UserNotFoundError)) {
                            description = "The user does not exist."
                        }
                    }
                }
            }
        }) {
            withLoggingContextAsync(mdcTraceId()) {
                call.receive<LoginData>().let { requestData ->
                    when (val result = userLogin.perform(requestData.email, requestData.password)) {
                        is Either.Right -> ApiResponse.respondSuccess(call, AuthData(result.value))
                        is Either.Left -> when (result.value) {
                            UserLoginAction.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                            UserLoginAction.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                            UserLoginAction.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
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
                HttpStatusCode.Unauthorized to {
                    description = "Authentication failed"
                    body(ApiResponse::class) {
                        example("Unauthorized", ApiResponse.authenticationFailed()) {
                            description = "The provided refresh token is invalid."
                        }
                    }
                }
                HttpStatusCode.Conflict to {
                    description = "Error during authentication."
                    body(ApiResponse::class) {
                        example("UserNotConfirmedError", ApiResponse.failure(UserIdentityService.UserNotConfirmedError)) {
                            description = " The user has not confirmed the code"
                        }
                        example("UserNotFoundError", ApiResponse.failure(UserIdentityService.UserNotFoundError)) {
                            description = "The user does not exist."
                        }
                    }
                }
            }
        }) {
            withLoggingContextAsync(mdcTraceId()) {
                call.receive<String>().let { requestData ->
                    when (val result = userRefresh.perform(requestData)) {
                        is Either.Right -> ApiResponse.respondSuccess(call, result.value)
                        is Either.Left -> when (result.value) {
                            UserRefreshTokenAction.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                            UserRefreshTokenAction.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                            UserRefreshTokenAction.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
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
                    HttpStatusCode.OK to {
                        description = "User was successfully deleted"
                    }
                    HttpStatusCode.Unauthorized to {
                        description = "Authentication failed"
                        body(ApiResponse::class) {
                            example("Unauthorized", ApiResponse.authenticationFailed()) {
                                description = "The provided email and password is invalid."
                            }
                        }
                    }
                }
            }) {
                withLoggingContextAsync(mdcTraceId()) {
                    call.receive<LoginData>().let { requestData ->
                        when (val result = userDelete.perform(requestData.email, requestData.password)) {
                            is Either.Right -> ApiResponse.respondSuccess(call)
                            is Either.Left -> when (result.value) {
                                UserDeleteAction.NotAuthorizedError -> ApiResponse.respondAuthFailed(call)
                                UserDeleteAction.UserNotConfirmedError -> ApiResponse.respondFailure(call, result.value)
                                UserDeleteAction.UserNotFoundError -> ApiResponse.respondFailure(call, result.value)
                            }
                        }
                    }
                }
            }
        }
    }
}