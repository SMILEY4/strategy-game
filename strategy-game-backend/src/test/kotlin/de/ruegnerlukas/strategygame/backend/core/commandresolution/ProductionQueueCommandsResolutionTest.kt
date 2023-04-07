package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCityId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectProductionQueue
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import io.kotest.core.spec.style.StringSpec

class ProductionQueueCommandsResolutionTest : StringSpec({

    "add buildings to production queue" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            submitTurn("user") {
                constructBuilding {
                    cityId = getCityId("Test City")
                    building = BuildingType.FARM
                }
                constructBuilding {
                    cityId = getCityId("Test City")
                    building = BuildingType.MARKET
                }
                constructSettler {
                    cityId = getCityId("Test City")
                }
            }
            expectProductionQueue(getCityId("Test City")) {
                entry("building.${BuildingType.FARM}")
                entry("building.${BuildingType.MARKET}")
                entry("settler")
            }
            submitTurn("user") {
                constructBuilding {
                    cityId = getCityId("Test City")
                    building = BuildingType.QUARRY
                }
            }
            expectProductionQueue(getCityId("Test City")) {
                entry("building.${BuildingType.FARM}")
                entry("building.${BuildingType.MARKET}")
                entry("settler")
                entry("building.${BuildingType.QUARRY}")
            }
        }
    }

})