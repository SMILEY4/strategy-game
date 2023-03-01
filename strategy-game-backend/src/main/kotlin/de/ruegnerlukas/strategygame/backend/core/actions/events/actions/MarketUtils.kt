package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

internal object MarketUtils {

	fun getResourceBalance(province: Province): ResourceStats {
		return ResourceStats.from(
			ResourceType.values().associateWith { getResourceBalance(province, it) }
		)
	}

	fun iterateResourceBalance(province: Province, consumer: (type: ResourceType, balance: Float) -> Unit) {
		ResourceType.values().forEach { type ->
			consumer(type, getResourceBalance(province, type))
		}
	}

	fun getResourceBalance(province: Province, type: ResourceType): Float {
		return province.resourcesProducedPrevTurn[type] - province.resourcesConsumedCurrTurn[type] - province.resourcesMissing[type]
	}

	fun getDemand(avg: ResourceStats, balance: ResourceStats): ResourceStats {
		return ResourceStats.from(
			ResourceType.values().associateWith { getDemand(it, avg, balance) }
		)
	}

	fun getDemand(type: ResourceType, avg: ResourceStats, balance: ResourceStats): Float {
		return avg[type] - balance[type]
	}

}