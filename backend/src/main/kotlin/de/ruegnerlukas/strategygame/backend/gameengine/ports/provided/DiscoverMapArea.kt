package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition

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