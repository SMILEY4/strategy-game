package io.github.smiley4.strategygame.backend.engine.module.gamestep

import io.github.smiley4.strategygame.backend.common.events.EventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.max
import io.github.smiley4.strategygame.backend.common.utils.validations
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.TerrainType


class GENValidateCreateCity(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

    object Definition : EventNodeDefinition<CreateCityOperationData, CreateCityOperationData, OperationInvalidData, Unit>()


    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolveCreateCity)
            action { data ->
                val result = validations {
                    mustBeTrue("CITY.NAME") {
                        data.targetName.isNotBlank()
                    }
                    mustBeTrue("CITY.TARGET_TILE_TYPE") {
                        data.targetTile.data.terrainType == TerrainType.LAND
                    }
                    mustBeTrue("CITY.TILE_SPACE") {
                        data.game.cities.find { it.tile.tileId == data.targetTile.tileId } == null
                    }
                    if (data.withNewProvince) {
                        mustBeTrue("CITY.TARGET_TILE_OWNER") {
                            (data.targetTile.owner == null || data.targetTile.owner?.countryId == data.country.countryId) && data.targetTile.owner?.cityId == null
                        }
                        mustBeTrue("CITY.COUNTRY_INFLUENCE") {
                            // country owns tile
                            if (data.targetTile.owner != null && data.targetTile.owner?.countryId == data.country.countryId) {
                                return@mustBeTrue true
                            }
                            // nobody else has more than 'MAX_TILE_INFLUENCE' influence
                            val maxForeignInfluence = data.targetTile.influences
                                .filter { it.countryId != data.country.countryId }
                                .map { it.amount }
                                .max { it }
                                ?: 0.0
                            if (maxForeignInfluence < gameConfig.cityTileMaxForeignInfluence) {
                                return@mustBeTrue true
                            }
                            // country has the most influence on tile
                            val maxCountryInfluence = data.targetTile.influences
                                .filter { it.countryId == data.country.countryId }
                                .map { it.amount }
                                .max { it }
                                ?: 0.0
                            if (maxCountryInfluence >= maxForeignInfluence) {
                                return@mustBeTrue true
                            }
                            return@mustBeTrue false
                        }
                    } else {
                        mustBeTrue("CITY.TARGET_TILE_OWNER") {
                            data.targetTile.owner?.countryId == data.country.countryId && data.targetTile.owner?.cityId == null
                        }
                    }
                    mustBeTrue("CITY.AVAILABLE_SETTLERS") {
                        data.country.availableSettlers > 0
                    }
                }
                if (result.isInvalid()) {
                    log().info("Invalid operation: creating city ${data.targetName}: ${result.getInvalidCodes()}")
                    eventResultCancel(OperationInvalidData(data.game, result.getInvalidCodes()))
                } else {
                    eventResultOk(data)
                }
            }
        }
    }

}