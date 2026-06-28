package io.github.smiley4.strategygame.identity.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.identity.auth.AuthService
import io.github.smiley4.strategygame.identity.auth.GenerateOneTimeGrantError
import io.github.smiley4.strategygame.identity.auth.domain.OneTimeToken
import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.routing.RequestOneTimeGrantRoute.RouteRequest
import io.github.smiley4.strategygame.identity.routing.RequestOneTimeGrantRoute.RouteResponse
import io.github.smiley4.strategygame.identity.routing.RequestOneTimeGrantRoute.RouteResponse.Success.AuthDataResponse
import io.github.smiley4.strategygame.shared.values.UserId
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeRequestOneTimeGrant() {
    get<RouteRequest, RouteResponse>("", {
        description = "Request a one time token as registered user."
    }) { request ->
        RequestOneTimeGrantRoute.handle(request)
    }
}


private object RequestOneTimeGrantRoute : KoinComponent {

    private val service by inject<AuthService>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            val token = service.generateOneTimeGrant(request.userId)
            return RouteResponse.Success(AuthDataResponse(token))
        } catch (e: GenerateOneTimeGrantError) {
            return when (e) {
                is GenerateOneTimeGrantError.InvalidToken -> RouteResponse.InvalidToken()
            }
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @AuthenticatedUserId val userId: UserId,
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The one time token was successfully granted.")
        class Success(
            @Body val body: AuthDataResponse
        ) : RouteResponse()  {

            @Serializable
            data class AuthDataResponse(
                val token: OneTimeToken
            )

        }


        @Response(HttpStatusCode.BAD_REQUEST, "The provided token invalid.")
        class InvalidToken(
            @Body val body: HttpErrorResponse = HttpErrorResponse(
                status = HttpStatusCode.BAD_REQUEST,
                errorCode = "INVALID_TOKEN",
                title = "Invalid token",
                detail = "The provided token is invalid.",
            )
        ) : RouteResponse()


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()

    }

}