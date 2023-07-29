package de.ruegnerlukas.strategygame.backend.gameengine.core.preview

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.utils.COUNTRY_COLORS
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gameengine.core.RouteGenerator
import de.ruegnerlukas.strategygame.backend.gameengine.core.RouteGenerator.Companion.GeneratedRoute
import de.ruegnerlukas.strategygame.backend.gameengine.core.RouteGenerator.Companion.RequestCity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewRequest
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityInfrastructure
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityMetadata
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityPopulation
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlementTier
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.RouteDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation.CountryNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation.PreviewCityCreationError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery

class PreviewCityCreationImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val routeGenerator: RouteGenerator
) : PreviewCityCreation {

    private val metricId = MetricId.action(PreviewCityCreation::class)

    override suspend fun perform(
        gameId: String,
        userId: String,
        request: CityCreationPreviewRequest
    ): Either<PreviewCityCreationError, CityCreationPreviewData> {
        return Monitoring.time(metricId) {
            either {
                val game = getGameState(gameId).bind()
                val country = getCountry(userId, game).bind()
                CityCreationPreviewData(
                    addedRoutes = getAddedRoutes(request.tile, game),
                    claimedTiles = getClaimedTiles(country, request.tile, game)
                )
            }
        }
    }


    /**
     * Find and return the [GameExtended] or [GameNotFoundError] if the game does not exist
     */
    private suspend fun getGameState(gameId: String): Either<GameNotFoundError, GameExtended> {
        return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * @return the [Country] of the given user or [CountryNotFoundError] if the country does not exist
     */
    private fun getCountry(userId: String, game: GameExtended): Either<CountryNotFoundError, Country> {
        return try {
            game.findCountryByUser(userId).ok()
        } catch (e: Exception) {
            CountryNotFoundError.err()
        }
    }


    /**
     * Get all routes that would get added by creating a new city at the given location by the given user
     */
    private suspend fun getAddedRoutes(location: TileRef, game: GameExtended): Sequence<RouteDTO> {
        return routeGenerator.getNewOrUpdated(game, RequestCity(
            cityId = null,
            isProvinceCapital = true,
            tile = location,
        )).mapIndexed { index, route ->
            RouteDTO(
                routeId = index.toString(),
                cityIdA = route.cityIdA ?: "?",
                cityIdB = route.cityIdB,
                path = listOf()
            )
        }
    }


    /**
     * Get all tiles that would get claimed by creating a new city at the given location by the given user
     */
    private fun getClaimedTiles(country: Country, location: TileRef, game: GameExtended): List<TileRef> {
        TODO()
        /*
        * combination of:
        * - GENUpdateCityTileOwnership
        * - GENUpdateCityInfluence
        * - GENUpdateInfluenceOwnership
        * */
    }

}