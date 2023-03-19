package de.ruegnerlukas.strategygame.backend.ports.provided.game

import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition

interface UncoverMapAreaAction {

    sealed class UncoverMapAreaActionError
    object GameNotFoundError : UncoverMapAreaActionError()

    suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int)

}