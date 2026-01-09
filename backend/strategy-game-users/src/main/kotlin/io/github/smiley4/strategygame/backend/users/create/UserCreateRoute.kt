package io.github.smiley4.strategygame.backend.users.create

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.internalError
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.user-create")

internal fun Route.routeUserCreate() {
    val userCreate by inject<UserCreate>()
    post<UserCreateRequest, UserCreateResponse>("signup") { request ->
        withLoggingContextAsync(mdcTraceId()) {
            try {
                userCreate.create(request.body.email, request.body.password, request.body.username)
                UserCreateResponse.Success()
            } catch (e: UserCreateError) {
                logger.warn(e) { "Failed to create user" }
                when (e) {
                    is UserCreateError.CodeDeliveryError -> UserCreateResponse.CodeDeliveryFailed()
                    is UserCreateError.InvalidEmailOrPasswordError -> UserCreateResponse.InvalidEmailOrPassword()
                    is UserCreateError.UserAlreadyExistsError -> UserCreateResponse.UserAlreadyExists()
                }
            } catch (e: Exception) {
                logger.warn(e) { "Failed to create user" }
                UserCreateResponse.InternalError()
            }
        }
    }
}


@Request
private class UserCreateRequest(
    @Body val body: CreateUserData
)

private sealed class UserCreateResponse {

    @Response(HttpStatusCode.OK, "The user successfully logged in.")
    class Success(
    ) : UserCreateResponse()


    @Response(HttpStatusCode.CONFLICT, "Code delivery failed")
    class CodeDeliveryFailed(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.CONFLICT,
            errorCode = "CODE_DELIVERY_FAILED",
            title = "Code delivery failed",
            detail = "Failed to deliver signup code.",
        )
    ) : UserCreateResponse()


    @Response(HttpStatusCode.BAD_REQUEST, "Invalid email or password")
    class InvalidEmailOrPassword(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.BAD_REQUEST,
            errorCode = "INVALID_EMAIL_OR_PASSWORD",
            title = "Invalid email or password",
            detail = "Provided email or password are not valid.",
        )
    ) : UserCreateResponse()


    @Response(HttpStatusCode.CONFLICT, "User already exists")
    class UserAlreadyExists(
        @Body val body: HttpErrorResponse = HttpErrorResponse(
            status = HttpStatusCode.CONFLICT,
            errorCode = "USER_ALREADY_EXISTS",
            title = "User already exists",
            detail = "A user with the provided email already exists.",
        )
    ) : UserCreateResponse()


    @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
    class InternalError(
        @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
    ) : UserCreateResponse()

}


@Serializable
private data class CreateUserData(
    val email: String,
    val password: String,
    val username: String
)