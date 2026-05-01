package io.github.smiley4.strategygame.identity.routing

import io.github.oshai.kotlinlogging.KotlinLogging
import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.identity.routing.RegisterUserRoute.RouteResponse
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.UserError
import io.github.smiley4.strategygame.identity.user.UserService
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeRegisterUser() {
    post<RegisterUserRoute.RouteRequest, RouteResponse>("/user", {
        description = "Register a new user"
    }) { request ->
        RegisterUserRoute.handle(request)
    }
}

private object RegisterUserRoute : KoinComponent {

    private val service by inject<UserService>()
    private val logger = KotlinLogging.logger {}

    suspend fun handle(request: RouteRequest): RouteResponse {
        try {
            val userId = service.register(
                Username(request.body.username),
                UnsafePassword(request.body.password)
            )
            return RouteResponse.Success()
        } catch (e: UserError) {
            logger.warn(e) { "Failed to register user" }
            return when (e) {
                is UserError.UnsafePasswordError.Empty -> RouteResponse.InvalidPassword()
                is UserError.UsernameError.Empty -> RouteResponse.InvalidUsername()
                is UserError.UsernameError.Invalid -> RouteResponse.InvalidUsername()
                is UserError.UsernameNotUnique -> RouteResponse.UsernameAlreadyTaken()
                is UserError.NotFound -> RouteResponse.InternalError()
            }
        } catch (e: Exception) {
            logger.warn(e) { "Failed to register user" }
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @Body val body: RequestBody
    ) {

        @Serializable
        data class RequestBody(
            val username: String,
            val password: String
        )

    }

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The user was successfully registered.")
        class Success : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided password is invalid.")
        class InvalidPassword(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_PASSWORD",
                title = "Invalid password",
                detail = "The provided password is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided username is invalid.")
        class InvalidUsername(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_USERNAME",
                title = "Invalid username",
                detail = "The provided username is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.CONFLICT, "The provided username is already taken.")
        class UsernameAlreadyTaken(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.CONFLICT,
                errorCode = "USERNAME_ALREADY_TAKEN",
                title = "Username taken",
                detail = "The provided username is already taken.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()


    }

}
