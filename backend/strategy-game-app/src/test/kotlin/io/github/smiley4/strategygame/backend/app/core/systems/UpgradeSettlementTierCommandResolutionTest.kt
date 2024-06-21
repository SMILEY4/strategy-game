package io.github.smiley4.strategygame.backend.app.core.systems

import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCityId
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCountryId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.submitTurn
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCities
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCity
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCommandResolutionErrors
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addCity
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addTown
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.engine.ports.models.SettlementTier
import io.github.smiley4.strategygame.backend.engine.ports.models.nextTier
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings
import io.kotest.core.spec.style.StringSpec

class UpgradeSettlementTierCommandResolutionTest : StringSpec({

    "upgrade settlement" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addCity {
                name = "Test City"
                tier = SettlementTier.VILLAGE
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                initialSize = SettlementTier.VILLAGE.nextTier()!!.minRequiredSize
            }
            submitTurn("user") {
                upgradeSettlementTier {
                    cityId = getCityId("Test City")
                }
            }
            expectCity {
                q = 0
                r = 0
                name = "Test City"
                countryId = getCountryId("user")
                tier = SettlementTier.TOWN
            }
        }
    }

    "upgrade max tier settlement is rejected" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addCity {
                name = "Test City"
                tier = SettlementTier.values().maxBy { it.level }
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                initialSize = SettlementTier.values().maxBy { it.level }.maxSize
            }
            submitTurn("user") {
                upgradeSettlementTier {
                    cityId = getCityId("Test City")
                }
            }
            expectCity {
                q = 0
                r = 0
                name = "Test City"
                countryId = getCountryId("user")
                tier = SettlementTier.values().maxBy { it.level }
            }
            expectCommandResolutionErrors {
                turn = 0
                errors = listOf("SETTLEMENT_TIER_UPGRADE.TARGET_TIER", "SETTLEMENT_TIER_UPGRADE.ONE_CITY_PER_PROVINCE")
            }
        }
    }

    "upgrade settlement without min required population size is rejected" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addCity {
                name = "Test City"
                tier = SettlementTier.TOWN
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                initialSize = SettlementTier.TOWN.nextTier()!!.minRequiredSize - 1
            }
            submitTurn("user") {
                upgradeSettlementTier {
                    cityId = getCityId("Test City")
                }
            }
            expectCity {
                q = 0
                r = 0
                name = "Test City"
                countryId = getCountryId("user")
                tier = SettlementTier.TOWN
            }
            expectCommandResolutionErrors {
                turn = 0
                errors = listOf("SETTLEMENT_TIER_UPGRADE.MIN_POP_SIZE")
            }
        }
    }

    "upgrade to second city in province is rejected" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addCity {
                name = "Test City"
                tier = SettlementTier.CITY
                tile = TilePosition(0, 0)
                countryId = getCountryId("user")
                initialSize = SettlementTier.CITY.minRequiredSize
            }
            addTown(getCityId("Test City")) {
                name = "Test Town"
                tier = SettlementTier.TOWN
                tile = TilePosition(10, 10)
                countryId = getCountryId("user")
                initialSize = SettlementTier.TOWN.nextTier()!!.minRequiredSize
            }
            submitTurn("user") {
                upgradeSettlementTier {
                    cityId = getCityId("Test Town")
                }
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                    tier = SettlementTier.CITY
                }
                town {
                    q = 10
                    r = 10
                    name = "Test Town"
                    countryId = getCountryId("user")
                    tier = SettlementTier.TOWN
                }
            }
            expectCommandResolutionErrors {
                turn = 0
                errors = listOf("SETTLEMENT_TIER_UPGRADE.ONE_CITY_PER_PROVINCE")
            }
        }
    }

})