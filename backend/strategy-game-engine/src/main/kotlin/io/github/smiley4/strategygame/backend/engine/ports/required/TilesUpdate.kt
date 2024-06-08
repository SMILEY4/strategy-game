package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.common.models.Tile


interface TilesUpdate {
    /**
     * @throws EntityNotFoundError
     */
    suspend fun execute(tiles: Collection<Tile>, gameId: String)
}