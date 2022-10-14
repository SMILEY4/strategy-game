package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class TilesQueryByGameImpl(private val database: ArangoDatabase) : TilesQueryByGame {

    override suspend fun execute(gameId: String): List<Tile> {
        database.assertCollections(Collections.TILES)
        return database.query(
            """
				FOR tile IN ${Collections.TILES}
					FILTER tile.gameId == @gameId
					RETURN tile
			""".trimIndent(),
            mapOf("gameId" to gameId),
            Tile::class.java
        )
    }

}