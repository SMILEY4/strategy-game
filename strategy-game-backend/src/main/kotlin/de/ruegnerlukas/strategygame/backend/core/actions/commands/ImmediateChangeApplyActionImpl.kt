package de.ruegnerlukas.strategygame.backend.core.actions.commands

import de.ruegnerlukas.strategygame.backend.ports.models.changes.DataChange
import de.ruegnerlukas.strategygame.backend.ports.models.changes.InsertCityChange
import de.ruegnerlukas.strategygame.backend.ports.models.changes.InsertMarkerChange
import de.ruegnerlukas.strategygame.backend.ports.models.changes.ModifyMoneyChange
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity

class ImmediateChangeApplyActionImpl() {

	fun perform(world: WorldExtendedEntity, changes: List<DataChange>) {
		changes.forEach { maybeApply(it, world) }
	}

	fun maybeApply(change: DataChange, world: WorldExtendedEntity) {
		when (change) {
			is InsertMarkerChange -> {
				// TODO: add marker to world
			}
			is InsertCityChange -> {
				// TODO: add city to world
			}
			is ModifyMoneyChange -> {
				// TODO: modify money amount
			}
		}
	}

}