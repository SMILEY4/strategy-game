package io.github.smiley4.strategygame.identity.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.identity.routing.ChangeUsernameRoute.RouteRequest
import io.github.smiley4.strategygame.identity.routing.ChangeUsernameRoute.RouteResponse
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.shared.UsernameError
import io.github.smiley4.strategygame.identity.user.ChangeUsernameError
import io.github.smiley4.strategygame.identity.user.UserService
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.domain.UserIdError
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeChangeUsername() {
    post<RouteRequest, RouteResponse>("", {
        description = "Change the username of a registered user."
    }) { request ->
        ChangeUsernameRoute.handle(request)
    }
}


private object ChangeUsernameRoute : KoinComponent {

    private val service by inject<UserService>()

    suspend fun handle(request: RouteRequest): RouteResponse {
        try {
            service.changeUsername(
                UserId(request.userId),
                Username(request.body.newUsername)
            )
            return RouteResponse.Success()
        } catch (_: UserIdError) {
            return RouteResponse.InvalidUserId()
        } catch (_: UsernameError) {
            return RouteResponse.InvalidUsername()
        } catch (e: ChangeUsernameError) {
            return when (e) {
                is ChangeUsernameError.UserNotFound -> RouteResponse.NotFound()
                is ChangeUsernameError.AlreadyTaken -> RouteResponse.UsernameAlreadyTaken()
            }
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedUserId val userId: String,
        @Body val body: RequestBody
    ) {

        @Serializable
        data class RequestBody(
            val newUsername: String,
        )

    }

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The username was successfully updated")
        class Success : RouteResponse()


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


        @Response(HttpStatusCode.BAD_REQUEST, "The provided user id is invalid.")
        class InvalidUserId(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_USER_ID",
                title = "Invalid user id",
                detail = "The provided user id is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.NOT_FOUND, "The user with the given id could not be found.")
        class NotFound(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.NOT_FOUND,
                errorCode = "USER_NOT_FOUND",
                title = "User not found",
                detail = "The user with the given id could not be found.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()


    }

}