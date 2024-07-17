package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.EventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.validations
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.ScoutTileObject


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
                        data.targetTile.objects
                            .filterIsInstance<ScoutTileObject>()
                            .none { it.countryId == data.country.countryId }
                    }
                    mustBeTrue("SCOUT.AMOUNT") {
                        data.game.tiles
                            .asSequence()
                            .mapNotNull { tile -> tile.objects.find { it is ScoutTileObject }?.let { it as ScoutTileObject } }
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