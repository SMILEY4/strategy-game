package de.ruegnerlukas.strategygame.backend.external.persistence.actions.gameext

import arrow.core.Either
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.country.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker.MarkerInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.order.OrderInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ExtGameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext.ExtGameInsert

class ExtGameInsertImpl(private val database: Database) : ExtGameInsert {

	override suspend fun execute(extGame: ExtGameEntity): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database.startTransaction(true) { txDb ->
					GameInsertImpl(txDb).execute(
						GameEntity(
							id = extGame.id,
							seed = extGame.seed,
							turn = extGame.turn
						)
					)
					if (extGame.tiles.isNotEmpty()) {
						TileInsertMultipleImpl(txDb).execute(extGame.tiles)
					}
					if (extGame.markers.isNotEmpty()) {
						MarkerInsertMultipleImpl(txDb).execute(extGame.markers)
					}
					if (extGame.players.isNotEmpty()) {
						PlayerInsertImpl(txDb).apply {
							extGame.players.forEach { execute(it) }
						}
					}
					if (extGame.countries.isNotEmpty()) {
						CountryInsertImpl(txDb).apply {
							extGame.countries.forEach { execute(it) }
						}
					}
				}
			}
			.mapLeft { throw it }
	}


}