package io.github.smiley4.strategygame.identity.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.post
import io.github.smiley4.strategygame.identity.routing.ChangePasswordRoute.RouteRequest
import io.github.smiley4.strategygame.identity.routing.ChangePasswordRoute.RouteResponse
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.UnsafePasswordError
import io.github.smiley4.strategygame.identity.user.ChangePasswordError
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

internal fun Route.routeChangePassword() {
    post<RouteRequest, RouteResponse>("/{userId}/password", {
        description = "Change the password of a registered user."
    }) { request ->
        ChangePasswordRoute.handle(request)
    }
}


private object ChangePasswordRoute : KoinComponent {

    private val service by inject<UserService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            service.changePassword(
                UserId(request.userId),
                UnsafePassword(request.body.newPassword)
            )
            return RouteResponse.Success()
        } catch (_: UserIdError) {
            return RouteResponse.InvalidUserId()
        } catch (_: UnsafePasswordError) {
            return RouteResponse.InvalidPassword()
        } catch (e: ChangePasswordError) {
            return when (e) {
                is ChangePasswordError.UserNotFound -> RouteResponse.NotFound()
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
            val newPassword: String,
        )

    }

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The password was successfully updated")
        class Success : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided user id is invalid.")
        class InvalidUserId(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_USER_ID",
                title = "Invalid user id",
                detail = "The provided user id is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.BAD_REQUEST, "The provided password is invalid.")
        class InvalidPassword(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_PASSWORD",
                title = "Invalid password",
                detail = "The provided password is invalid.",
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