package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.TileType
import de.ruegnerlukas.strategygame.backend.common.utils.max
import de.ruegnerlukas.strategygame.backend.common.utils.validations

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
                        data.targetTile.data.terrainType == TileType.LAND
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