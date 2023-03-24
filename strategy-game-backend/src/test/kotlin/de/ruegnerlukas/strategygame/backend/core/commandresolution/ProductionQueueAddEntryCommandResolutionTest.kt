package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.testutils.gameTest
import io.kotest.core.spec.style.StringSpec

class ProductionQueueAddEntryCommandResolutionTest : StringSpec({

    "add buildings to production queue" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            endTurn()
            resolveCommands {
                productionQueueAddBuilding(getCountryId("user")) {
                    cityId = getCityId("Test City")
                    buildingType = BuildingType.FARM
                }
                productionQueueAddBuilding(getCountryId("user")) {
                    cityId = getCityId("Test City")
                    buildingType = BuildingType.MARKET
                }
            }
            expectProductionQueue(getCityId("Test City")) {
                entry { buildingType = BuildingType.FARM }
                entry { buildingType = BuildingType.MARKET }
            }
            endTurn()
            resolveCommands {
                productionQueueAddBuilding(getCountryId("user")) {
                    cityId = getCityId("Test City")
                    buildingType = BuildingType.QUARRY
                }
            }
            expectProductionQueue(getCityId("Test City")) {
                entry { buildingType = BuildingType.FARM }
                entry { buildingType = BuildingType.MARKET }
                entry { buildingType = BuildingType.QUARRY }
            }
        }
    }

})