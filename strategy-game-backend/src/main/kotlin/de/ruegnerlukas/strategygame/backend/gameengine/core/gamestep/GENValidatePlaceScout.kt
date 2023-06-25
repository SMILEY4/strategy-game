package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.common.utils.validations

class GENValidatePlaceScout(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

    object Definition : EventNodeDefinition<PlaceScoutOperationData, PlaceScoutOperationData, OperationInvalidData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolvePlaceScout)
            action { data ->
                val result = validations {
                    mustBeTrue("SCOUT.TILE_VISIBILITY") {
                        data.targetTile.discoveredByCountries.contains(data.country.countryId)
                    }
                    mustBeTrue("SCOUT.TILE_SPACE") {
                        data.targetTile.content
                            .filterIsInstance<ScoutTileContent>()
                            .none { it.countryId == data.country.countryId }
                    }
                    mustBeTrue("SCOUT.AMOUNT") {
                        data.game.tiles
                            .asSequence()
                            .mapNotNull { tile -> tile.content.find { it is ScoutTileContent }?.let { it as ScoutTileContent } }
                            .filter { scout -> scout.countryId == data.country.countryId }
                            .count() < gameConfig.scoutsMaxAmount
                    }
                }
                if (result.isInvalid()) {
                    log().info("Invalid operation: ${result.getInvalidCodes()}")
                    eventResultCancel(OperationInvalidData(data.game, result.getInvalidCodes()))
                } else {
                    eventResultOk(data)
                }
            }
        }
    }

}