package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayersQueryByGameStatePlaying
import de.ruegnerlukas.strategygame.backend.shared.either.Either

class PlayersQueryByGameStatePlayingImpl(private val database: Database) : PlayersQueryByGameStatePlaying {

	override suspend fun execute(gameId: String): Either<List<PlayerEntity>, ApplicationError> {
		return Either.run {
			database
				.startQuery("player.query.by_game_and_state_playing") {
					SQL
						.select(PlayerTbl.id, PlayerTbl.userId, PlayerTbl.gameId, PlayerTbl.connectionId, PlayerTbl.state)
						.from(PlayerTbl)
						.where(PlayerTbl.gameId.isEqual(placeholder("gameId")) and PlayerTbl.state.isEqual(PlayerEntity.STATE_PLAYING))
				}
				.parameters {
					it["gameId"] = gameId
				}
				.execute()
				.getMultipleOrNone { rs ->
					PlayerEntity(
						id = rs.getString(PlayerTbl.id),
						userId = rs.getString(PlayerTbl.userId),
						gameId = rs.getString(PlayerTbl.gameId),
						connectionId = rs.getIntOrNull(PlayerTbl.connectionId),
						state = rs.getString(PlayerTbl.state)
					)
				}
		}
	}

}