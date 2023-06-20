package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition

interface UncoverMapAreaAction {

    sealed class UncoverMapAreaActionError
    object GameNotFoundError : UncoverMapAreaActionError()

    suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int)

}