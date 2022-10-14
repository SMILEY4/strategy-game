package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameInsert
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.shared.getOrThrow

class GameInsertImpl(private val database: ArangoDatabase) : GameInsert {

	override suspend fun execute(game: Game, tiles: List<Tile>): String {
		val gameKey = database.insertDocument(Collections.GAMES, game).getOrThrow().key
		tiles.forEach { it.gameId = gameKey }
		database.insertDocuments(Collections.TILES, tiles)
		return gameKey
	}

}