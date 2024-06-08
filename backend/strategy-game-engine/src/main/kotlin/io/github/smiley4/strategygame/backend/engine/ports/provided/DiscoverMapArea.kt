package io.github.smiley4.strategygame.backend.engine.ports.provided

import io.github.smiley4.strategygame.backend.common.models.TilePosition


interface DiscoverMapArea {

    sealed class DiscoverMapAreaError : Exception()


    /**
     * The requested game could not be found
     */
    class GameNotFoundError : DiscoverMapAreaError()


    /**
     * No tiles exist at the requested position
     */
    class NoTilesError : DiscoverMapAreaError()


    /**
     * Discovers all tiles at the given position for the given country
     * @throws DiscoverMapAreaError
     */
    suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int)

}