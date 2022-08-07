package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameInsert
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class GameInsertImpl(private val database: ArangoDatabase) : GameInsert {

	override suspend fun execute(game: GameEntity, tiles: List<TileEntity>): String {
		val gameKey = database.insertDocument(Collections.GAMES, game).key
		tiles.forEach { it.gameId = gameKey }
		database.insertDocuments(Collections.TILES, tiles)
		return gameKey
	}

}