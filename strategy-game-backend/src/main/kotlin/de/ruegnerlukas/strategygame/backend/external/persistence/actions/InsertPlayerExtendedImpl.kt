package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CountryTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertPlayerExtended

class InsertPlayerExtendedImpl(val database: Database) : InsertPlayerExtended {

	override suspend fun execute(extPlayer: PlayerExtendedEntity) {
		database.startTransaction(true) { txDb ->
			txDb
				.startInsert("ext-player.insert#country") {
					SQL
						.insert()
						.into(CountryTbl)
						.columns(CountryTbl.id, CountryTbl.gameId, CountryTbl.amountMoney)
						.items(
							SQL.item()
								.set(CountryTbl.id, placeholder("id"))
								.set(CountryTbl.gameId, placeholder("gameId"))
								.set(CountryTbl.amountMoney, placeholder("amountMoney"))

						)
				}
				.parameters {
					it["id"] = extPlayer.country.id
					it["gameId"] = extPlayer.country.gameId
					it["amountMoney"] = extPlayer.country.amountMoney
				}
				.execute()
			txDb
				.startInsert("ext-player.insert#player") {
					SQL
						.insert()
						.into(PlayerTbl)
						.columns(
							PlayerTbl.id,
							PlayerTbl.userId,
							PlayerTbl.gameId,
							PlayerTbl.connectionId,
							PlayerTbl.state,
							PlayerTbl.countryId
						)
						.items(
							SQL.item()
								.set(PlayerTbl.id, placeholder("id"))
								.set(PlayerTbl.userId, placeholder("userId"))
								.set(PlayerTbl.gameId, placeholder("gameId"))
								.set(PlayerTbl.connectionId, placeholder("connectionId"))
								.set(PlayerTbl.state, placeholder("state"))
								.set(PlayerTbl.countryId, placeholder("countryId"))
						)
				}
				.parameters {
					it["id"] = extPlayer.player.id
					it["userId"] = extPlayer.player.userId
					it["gameId"] = extPlayer.player.gameId
					it["connectionId"] = extPlayer.player.connectionId
					it["state"] = extPlayer.player.state
					it["countryId"] = extPlayer.player.countryId
				}
				.execute()
		}
	}

}