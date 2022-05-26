package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.shared.Either

interface GameRepository {
	fun save(entities: List<Game>): Either<List<Game>, ApplicationError>
	fun save(entity: Game): Either<Game, ApplicationError>
	fun get(gameId: String): Either<Game, ApplicationError>
	fun getByUserId(userId: String): Either<List<Game>, ApplicationError>
}