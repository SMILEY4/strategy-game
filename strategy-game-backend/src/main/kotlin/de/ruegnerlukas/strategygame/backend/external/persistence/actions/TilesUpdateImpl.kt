package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesUpdate
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class TilesUpdateImpl(private val database: ArangoDatabase) : TilesUpdate {

    override suspend fun execute(tiles: List<Tile>): Either<EntityNotFoundError, Unit> {
        return if (database.replaceDocuments(Collections.TILES, tiles).size == tiles.size) {
            Unit.right()
        } else {
            EntityNotFoundError.left()
        }
    }

}