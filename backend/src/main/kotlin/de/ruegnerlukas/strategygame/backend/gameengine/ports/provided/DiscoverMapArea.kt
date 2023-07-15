package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition

interface DiscoverMapArea {

    sealed interface DiscoverMapAreaError

    object GameNotFoundError : DiscoverMapAreaError {
        override fun toString(): String = this.javaClass.simpleName
    }

    object NoTilesError : DiscoverMapAreaError {
        override fun toString(): String = this.javaClass.simpleName
    }


    /**
     * Discovers all tiles at the given position for the given country
     */
    suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int): Either<DiscoverMapAreaError, Unit>

}