package de.ruegnerlukas.strategygame.backend.external.persistence.actions.country

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CountryTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.country.CountriesQueryByGame

class CountriesQueryByGameImpl(private val database: Database) : CountriesQueryByGame {

	override suspend fun execute(gameId: String): Either<DatabaseError, List<CountryEntity>> {
		return Either
			.catch {
				database
					.startQuery("country.query.by_game") {
						SQL
							.select(CountryTbl.id, CountryTbl.playerId, CountryTbl.amountMoney)
							.from(CountryTbl, PlayerTbl, GameTbl)
							.where(
								CountryTbl.playerId.isEqual(PlayerTbl.id)
										and PlayerTbl.gameId.isEqual(placeholder("gameId"))
							)
					}
					.parameters {
						it["gameId"] = gameId
					}
					.execute()
					.getMultipleOrNone {
						CountryEntity(
							id = it.getString(CountryTbl.id),
							playerId = it.getString(CountryTbl.playerId),
							amountMoney = it.getFloat(CountryTbl.amountMoney),
						)
					}
			}
			.mapLeft { throw it }
	}
}