package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceLedger
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

class ProvinceEntity(
	val gameId: String,
	val countryId: String,
	val cityIds: List<String>,
	val provinceCityId: String,
	val resourceLedgerPrevTurn: ResourceLedger,
	val resourceLedgerCurrTurn: ResourceLedger,
	val tradeRoutes: List<TradeRouteEntity>?, // todo: make non nullable
	key: String? = null,
) : DbEntity(key) {

	companion object {
		fun of(serviceModel: Province, gameId: String) = ProvinceEntity(
			key = DbId.asDbId(serviceModel.provinceId),
			gameId = gameId,
			countryId = serviceModel.countryId,
			cityIds = serviceModel.cityIds.toList(),
			provinceCityId = serviceModel.provinceCapitalCityId,
			// todo: properly/manually migrate model from ledger to stats in db
			resourceLedgerPrevTurn = serviceModel.resourcesProducedPrevTurn.toLedger(),
			resourceLedgerCurrTurn = serviceModel.resourcesProducedCurrTurn.toLedger(),
			tradeRoutes = serviceModel.tradeRoutes.map { TradeRouteEntity.of(it) }
		)

		private fun ResourceStats.toLedger(): ResourceLedger { // todo: temp
			return ResourceLedger().also { ledger ->
				ResourceType.values().forEach { type ->
					ledger.addEntry(type, this[type], "")
				}
			}
		}

		private fun ResourceLedger.toStats(): ResourceStats { // todo: temp
			return ResourceStats().also { stats ->
				ResourceType.values().forEach { type ->
					stats.add(type, this.getChangeTotal(type))
				}
			}
		}
	}

	fun asServiceModel() = Province(
		provinceId = this.getKeyOrThrow(),
		countryId = this.countryId,
		cityIds = this.cityIds.toMutableList(),
		provinceCapitalCityId = this.provinceCityId,
		resourcesProducedPrevTurn = this.resourceLedgerPrevTurn.toStats(),
		resourcesProducedCurrTurn = this.resourceLedgerCurrTurn.toStats(),
		resourcesConsumedCurrTurn = ResourceStats(),
		resourcesMissing = ResourceStats(),
		tradeRoutes = this.tradeRoutes?.map { it.asServiceModel() }?.toMutableList() ?: mutableListOf() // todo: make non-nullable
	)


}
