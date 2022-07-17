package de.ruegnerlukas.strategygame.backend.testutils

import arrow.core.getOrHandle
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCommandsByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryPlayerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryPlayersByGameImpl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

object TestUtils {

	suspend fun getPlayer(database: Database, userId: String, gameId: String): PlayerEntity {
		return QueryPlayerImpl(database).execute(userId, gameId).getOrHandle { throw Exception(it.toString()) }
	}

	suspend fun getGame(database: Database, gameId: String): GameEntity {
		return QueryGameImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }
	}

	suspend fun getCommands(database: Database, gameId: String, turn: Int): List<CommandEntity> {
		return QueryCommandsByGameImpl(database).execute(gameId, turn)
	}

	suspend fun getPlayers(database: Database, gameId: String): List<PlayerEntity> {
		return QueryPlayersByGameImpl(database).execute(gameId)
	}


}