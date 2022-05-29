package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import org.ktorm.schema.Table
import org.ktorm.schema.varchar

class SqliteGameRepository: GameRepository {

	override fun save(entities: List<Game>): Either<List<Game>, ApplicationError> {
		TODO("Not yet implemented")
	}

	override fun save(entity: Game): Either<Game, ApplicationError> {
		TODO("Not yet implemented")
	}

	override fun get(gameId: String): Either<Game, ApplicationError> {
		TODO("Not yet implemented")
	}

	override fun getByUserId(userId: String): Either<List<Game>, ApplicationError> {
		TODO("Not yet implemented")
	}
}


object TableDefinitions {

	object Participant: Table<Nothing>("participant") {
		val gameId = varchar("gameId").primaryKey()
		val userId = varchar("userId").primaryKey()
	}

}
