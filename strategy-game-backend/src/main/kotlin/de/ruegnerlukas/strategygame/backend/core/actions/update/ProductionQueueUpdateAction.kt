package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.provided.update.TurnUpdateAction

/**
 * Updates the entries in production queues
 */
class ProductionQueueUpdateAction(private val turnUpdateAction: TurnUpdateAction) {

    suspend fun perform(game: GameExtended) {
        game.cities.forEach { update(game, it) }
    }

    private suspend fun update(game: GameExtended, city: City) {
        city.productionQueue.firstOrNull()?.also { update(game, city, it) }
    }

    private suspend fun update(game: GameExtended, city: City, queueEntry: ProductionQueueEntry) {
        if (isCompleted(queueEntry)) {
            city.productionQueue.remove(queueEntry)
            turnUpdateAction.commandCreateBuilding(
                game = game,
                command = Command( // TODO: temporary - dont use command for this
                    commandId = "todo-id",
                    turn = game.game.turn,
                    countryId = city.countryId,
                    data = CreateBuildingCommandData(
                        cityId = city.cityId,
                        buildingType = queueEntry.buildingType
                    )
                )
            )
        }
    }

    private fun isCompleted(queueEntry: ProductionQueueEntry): Boolean {
        return queueEntry.collectedResources.let { collected ->
            queueEntry.getTotalRequiredResources().all { required ->
                collected.hasAtLeast(required.type, required.amount)
            }
        }
    }

}