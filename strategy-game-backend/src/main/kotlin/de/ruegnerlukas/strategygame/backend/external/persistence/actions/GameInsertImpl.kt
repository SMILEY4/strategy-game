package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameInsert
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.getOrThrow

class GameInsertImpl(private val database: ArangoDatabase) : GameInsert {

	override suspend fun execute(game: Game, tiles: List<Tile>): String {
		val keyGame = insertGame(game)
		insertTiles(keyGame, tiles)
		return keyGame
	}

	private suspend fun insertGame(game: Game): String {
		return database.insertDocument(Collections.GAMES, GameEntity.of(game)).getOrThrow().key
	}

	private suspend fun insertTiles(keyGame: String, tiles: List<Tile>) {
		tiles.forEach { it.gameId = keyGame }
		database.insertDocuments(Collections.TILES, tiles.map { TileEntity.of(it) })
	}

}