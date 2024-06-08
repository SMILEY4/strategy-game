package io.github.smiley4.strategygame.backend.app.core.systems

import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCityId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.submitTurn
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectProductionQueue
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.worldgen.WorldSettings
import io.kotest.core.spec.style.StringSpec

class ProductionQueueCommandsResolutionTest : StringSpec({

    "add entries to production queue" {
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