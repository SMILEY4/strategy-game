package io.github.smiley4.strategygame.engine.routing

import io.github.smiley4.ktorplus.data.Body
import io.github.smiley4.ktorplus.data.HttpStatusCode
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.data.Request
import io.github.smiley4.ktorplus.data.Response
import io.github.smiley4.ktorplus.get
import io.github.smiley4.strategygame.engine.routing.RequestSettlementNameRoute.RouteRequest
import io.github.smiley4.strategygame.engine.routing.RequestSettlementNameRoute.RouteResponse
import io.github.smiley4.strategygame.engine.routing.RequestSettlementNameRoute.RouteResponse.Success.SettlementNameData
import io.github.smiley4.strategygame.engine.simulation.generation.NameGenerator
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.utils.HttpErrorResponse
import io.github.smiley4.strategygame.shared.utils.internalError
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import io.ktor.server.routing.Route
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject


internal fun Route.routeRequestSettlementName() {
    get<RouteRequest, RouteResponse>("", {
        description = "Generate a random new settlement name."
    }) { request ->
        RequestSettlementNameRoute.handle(request)
    }
}


private object RequestSettlementNameRoute : KoinComponent {

    private val service by inject<NameGenerator>()

    fun handle(request: RouteRequest): RouteResponse {
        try {
            val name = service.generateSettlementName();
            return RouteResponse.Success(
                SettlementNameData(name)
            )
        } catch (_: Exception) {
            return RouteResponse.InternalError()
        }
    }


    @Request
    class RouteRequest(
        @PathParameter val gameId: GameId,
        @AuthenticatedUserId val userId: UserId,
    )

    sealed class RouteResponse {

        @Response(HttpStatusCode.OK, "The settlement name was successfully generated")
        class Success(
            @Body val body: SettlementNameData
        ) : RouteResponse() {

            @Serializable
            data class SettlementNameData(
                val name: String
            )

        }


        @Response(HttpStatusCode.INTERNAL_SERVER_ERROR, "An internal error occurred.")
        class InternalError(
            @Body val body: HttpErrorResponse = HttpErrorResponse.internalError()
        ) : RouteResponse()


    }


}