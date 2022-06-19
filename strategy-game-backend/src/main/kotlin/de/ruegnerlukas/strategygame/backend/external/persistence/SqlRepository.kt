package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.SQL.item
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.InternalApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.shared.UUID
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.Err
import de.ruegnerlukas.strategygame.backend.shared.either.Ok
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class SqlRepository(private val db: Database) : Repository {

	override suspend fun insertGame() = Either
		.runCatching {
			db
				.startInsert("insert_game") {
					SQL
						.insert()
						.into(GameTbl)
						.columns(GameTbl.gameId)
						.items(
							item().set(GameTbl.gameId, placeholder("gameId"))
						)
						.returning(GameTbl.gameId)
				}
				.withReturning()
				.parameter("gameId", UUID.gen())
				.execute()
				.mapRows { it.getString(GameTbl.gameId.columnName) }
		}
		.mapError { InternalApplicationError }
		.flatMap { if (it.size == 1) Ok(it.first()) else Err(InternalApplicationError) }


	override suspend fun getGame(gameId: String) = Either
		.runCatching {
			db
				.startQuery("get_game_by_id") {
					SQL
						.select(GameTbl.gameId)
						.from(GameTbl)
						.where(GameTbl.gameId.isEqual(placeholder("gameId")))
				}
				.parameter("gameId", gameId)
				.execute()
				.mapRows { it.getString(GameTbl.gameId.columnName) }
		}
		.mapError { InternalApplicationError }
		.flatMap { if (it.size == 1) Ok(it.first()) else Err(EntityNotFoundError) }


	override suspend fun insertTiles(gameId: String, tiles: List<Tile>) = Either
		.runCatching {
			db.startTransaction(true) { tdb ->
				tiles.chunked(50).forEach { batch ->
					tdb
						.startInsert {
							SQL
								.insert()
								.into(TileTbl)
								.columns(TileTbl.tileId, TileTbl.q, TileTbl.r, TileTbl.gameId)
								.items(
									batch.map {
										item()
											.set(TileTbl.tileId, UUID.gen())
											.set(TileTbl.q, it.q)
											.set(TileTbl.r, it.r)
											.set(TileTbl.gameId, gameId)
									}
								)
						}
						.withUpdateCount()
						.execute()
				}
			}
		}
		.mapError { InternalApplicationError }
		.discardValue()


	override suspend fun insertParticipant(gameId: String, userId: String) = Either
		.runCatching {
			db
				.startInsert("insert_participant") {
					SQL
						.insert()
						.into(ParticipantTbl)
						.columns(ParticipantTbl.participantId, ParticipantTbl.gameId, ParticipantTbl.userId)
						.items(
							item()
								.set(ParticipantTbl.participantId, "participantId")
								.set(ParticipantTbl.gameId, "gameId")
								.set(ParticipantTbl.userId, "userId")
						)
						.returning(ParticipantTbl.participantId)
				}
				.withReturning()
				.parameter("participantId", UUID.gen())
				.parameter("gameId", gameId)
				.parameter("userId", userId)
				.execute()
				.mapRows { it.getString(ParticipantTbl.participantId.columnName) }
		}
		.mapError { InternalApplicationError }
		.flatMap { if (it.size == 1) Ok(it.first()) else Err(InternalApplicationError) }

}