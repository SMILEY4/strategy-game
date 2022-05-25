package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.new.GameLobbyEntity
import de.ruegnerlukas.strategygame.backend.shared.Either

interface GameRepository {
	fun save(entities: List<GameLobbyEntity>): Either<List<GameLobbyEntity>, ApplicationError>
	fun save(entity: GameLobbyEntity): Either<GameLobbyEntity, ApplicationError>
	fun get(gameId: String): Either<GameLobbyEntity, ApplicationError>
	fun getByUserId(userId: String): Either<List<GameLobbyEntity>, ApplicationError>
}