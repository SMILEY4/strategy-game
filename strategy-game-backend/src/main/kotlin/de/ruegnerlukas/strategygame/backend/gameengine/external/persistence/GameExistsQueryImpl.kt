package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExistsQuery

class GameExistsQueryImpl(val database: ArangoDatabase) : GameExistsQuery {

    override suspend fun perform(gameId: String): Boolean {
        return database.existsDocument(Collections.GAMES, gameId)
    }

}