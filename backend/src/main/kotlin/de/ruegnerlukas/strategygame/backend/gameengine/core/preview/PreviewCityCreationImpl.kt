package de.ruegnerlukas.strategygame.backend.gameengine.core.preview

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.utils.distance
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.max
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import de.ruegnerlukas.strategygame.backend.gameengine.core.common.RouteGenerator
import de.ruegnerlukas.strategygame.backend.gameengine.core.common.RouteGenerator.Companion.RequestCity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewRequest
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.RouteDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation.CountryNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation.PreviewCityCreationError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery
import kotlin.math.max

class PreviewCityCreationImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val routeGenerator: RouteGenerator,
    private val gameConfig: GameConfig
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
                val tile = getTileRef(game, request.tile)
                val country = getCountry(userId, game).bind()
                CityCreationPreviewData(
                    addedRoutes = getAddedRoutes(tile, game).toList(),
                    claimedTiles = getClaimedTiles(country, tile, request.isProvinceCapital, game)
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


    private fun getTileRef(game: GameExtended, pos: TilePosition): TileRef {
        return TileRef(game.findTile(pos))
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
    private suspend fun getAddedRoutes(cityLocation: TileRef, game: GameExtended): Sequence<RouteDTO> {
        return routeGenerator.getNewOrUpdated(game, RequestCity(
            cityId = null,
            isProvinceCapital = true,
            tile = cityLocation,
        )).mapIndexed { index, route ->
            RouteDTO(
                routeId = index.toString(),
                cityIdA = route.cityIdA ?: "?",
                cityIdB = route.cityIdB,
                path = route.path
            )
        }
    }


    /**
     * Get all tiles that would get claimed by creating a new city at the given location by the given user
     */
    private fun getClaimedTiles(country: Country, cityLocation: TileRef, isProvinceCapital: Boolean, game: GameExtended): List<TileRef> {
        val claimedTiles = mutableSetOf<TileRef>()

        // by city influence
        influenceAffectedTiles(game, cityLocation) { tile ->
            val influence = calculateTileInfluences(tile, isProvinceCapital, cityLocation)
            if(influence != null && isRelevantInfluence(influence)) {
                if(tile.owner?.cityId == null) {
                    val currentMaxInfluence = getMaxInfluence(tile)
                    if(currentMaxInfluence == null || currentMaxInfluence.amount < influence) {
                        claimedTiles.add(TileRef(tile))
                    }
                }
            }
        }

        // by direct city ownership
        claimAffectedTiles(game, cityLocation) { tile ->
            if (canOwnTile(tile, country.countryId)) {
                claimedTiles.add(TileRef(tile))
            }
        }

        return claimedTiles.toList()
    }

    private fun influenceAffectedTiles(game: GameExtended, cityLocation: TileRef, consumer: (tile: Tile) -> Unit) {
        positionsCircle(cityLocation, gameConfig.cityMaxRange) { q, r ->
            game.findTileOrNull(q, r)?.also { consumer(it) }
        }
    }

    private fun claimAffectedTiles(game: GameExtended, cityLocation: TileRef, consumer: (tile: Tile) -> Unit) {
        positionsCircle(cityLocation, 1) { q, r ->
            game.findTileOrNull(q, r)?.let { tile ->
                consumer(tile)
            }
        }
    }

    private fun calculateTileInfluences(tile: Tile, isProvinceCapital: Boolean, cityLocation: TileRef): Double? {
        val influenceSpread = if (isProvinceCapital) gameConfig.cityInfluenceSpread else gameConfig.townInfluenceSpread
        val influenceAmount = if (isProvinceCapital) gameConfig.cityInfluenceAmount else gameConfig.townInfluenceAmount
        val cityInfluence = calcInfluence(tile.position.distance(cityLocation), influenceSpread, influenceAmount)
        return if (cityInfluence > 0) { cityInfluence } else { null }
    }

    private fun calcInfluence(distance: Int, spread: Float, amount: Float): Double {
        return max((-(distance.toDouble() / spread) + 1) * amount, 0.0)
    }

    private fun getMaxInfluence(tile: Tile): TileInfluence? {
        return tile.influences.max { it.amount }
    }

    private fun isRelevantInfluence(influenceAmount: Double): Boolean {
        return influenceAmount >= gameConfig.tileOwnerInfluenceThreshold
    }

    private fun canOwnTile(tile: Tile, countryId: String): Boolean {
        return tile.owner == null || (tile.owner?.countryId == countryId && tile.owner?.cityId == null)
    }

}