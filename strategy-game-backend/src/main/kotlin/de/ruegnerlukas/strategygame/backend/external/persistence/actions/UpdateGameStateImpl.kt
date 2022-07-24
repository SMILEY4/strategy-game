package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CityTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.CountryTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGameState

class UpdateGameStateImpl(private val database: Database) : UpdateGameState {

	override suspend fun perform(gameState: GameState) {
		database.startTransaction(true) { txDb ->
			updateCountries(txDb, gameState)
			updateCities(txDb, gameState)
			updateMarkers(txDb, gameState)
		}
	}

	private suspend fun updateCountries(db: Database, gameState: GameState) {
		val dirtyCountries = gameState.countries.filter { it.isDirty() }
		db.insertBatched(50, dirtyCountries) { batch ->
			SQL.insertOrUpdate()
				.into(CountryTbl)
				.columns(CountryTbl.id, CountryTbl.worldId, CountryTbl.amountMoney)
				.items(batch.map {
					SQL.item()
						.set(CountryTbl.id, it.id)
						.set(CountryTbl.worldId, gameState.worldId)
						.set(CountryTbl.amountMoney, it.amountMoney.get())
				})
		}
	}

	private suspend fun updateCities(db: Database, gameState: GameState) {
		val dirtyCities = gameState.cities.getAddedOrUpdated()
		db.insertBatched(50, dirtyCities) { batch ->
			SQL.insertOrUpdate()
				.into(CityTbl)
				.columns(CityTbl.id, CityTbl.tileId)
				.items(batch.map {
					SQL.item()
						.set(CityTbl.id, it.id)
						.set(CityTbl.tileId, it.tileId)
				})
		}
	}


	private suspend fun updateMarkers(db: Database, gameState: GameState) {
		val dirtyMarkers = gameState.markers.getAddedOrUpdated()
		db.insertBatched(50, dirtyMarkers) { batch ->
			SQL.insertOrUpdate()
				.into(MarkerTbl)
				.columns(MarkerTbl.id, MarkerTbl.tileId, MarkerTbl.playerId)
				.items(batch.map {
					SQL.item()
						.set(MarkerTbl.id, it.id)
						.set(MarkerTbl.tileId, it.tileId)
						.set(MarkerTbl.playerId, it.playerId)
				})
		}
	}

}