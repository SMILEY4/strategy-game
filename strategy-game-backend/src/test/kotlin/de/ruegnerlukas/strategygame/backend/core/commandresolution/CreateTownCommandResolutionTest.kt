package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.testutils.gameTest
import io.kotest.core.spec.style.StringSpec

class CreateTownCommandResolutionTest : StringSpec({

    "create towns" {
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
                createTown(getCountryId("user")) {
                    q = 2
                    r = 0
                    name = "Test Town 1"
                    parentCity = getCityId("Test City")
                }
                createTown(getCountryId("user")) {
                    q = -2
                    r = 0
                    name = "Test Town 2"
                    parentCity = getCityId("Test City")
                }
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                }
                city {
                    q = 2
                    r = 0
                    name = "Test Town 1"
                    countryId = getCountryId("user")
                    parentCity = getCityId("Test City")
                }
                city {
                    q = -2
                    r = 0
                    name = "Test Town 2"
                    countryId = getCountryId("user")
                    parentCity = getCityId("Test City")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = gameCfg().startingAmountMoney - gameCfg().cityCost + gameCfg().cityIncomePerTurn - gameCfg().townCost * 2
            }
        }
    }

    "create town with invalid name, reject" {
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
                createTown(getCountryId("user")) {
                    q = 2
                    r = 0
                    name = "   "
                    parentCity = getCityId("Test City")
                }
            }
            expectCommandResolutionErrors(1, "TOWN.NAME")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = gameCfg().startingAmountMoney - gameCfg().cityCost + gameCfg().cityIncomePerTurn
            }
        }
    }

    "create town without enough resources, reject" {
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
            setCountryMoney(getCountryId("user"), gameCfg().townCost - 1f)
            resolveCommands {
                createTown(getCountryId("user")) {
                    q = 2
                    r = 0
                    name = "Test City"
                    parentCity = getCityId("Test City")
                }
            }
            expectCommandResolutionErrors(1, "TOWN.RESOURCES")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = gameCfg().townCost - 1f
            }
        }
    }


    "create town on already occupied tile, reject" {
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
                createTown(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "Test Town"
                    parentCity = getCityId("Test City")
                }
            }
            expectCommandResolutionErrors(1, "TOWN.TILE_SPACE")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = gameCfg().startingAmountMoney - gameCfg().cityCost + gameCfg().cityIncomePerTurn
            }
        }
    }

    "create town with invalid city, reject" {
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
                createTown(getCountryId("user")) {
                    q = 1
                    r = 1
                    name = "Test Town"
                    parentCity = "unknown-city-id"
                }
            }
            expectCommandResolutionErrors(1, "TOWN.TARGET_TILE_OWNER")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = gameCfg().startingAmountMoney - gameCfg().cityCost + gameCfg().cityIncomePerTurn
            }
        }
    }

    "create town outside of city border, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "Test City 1"
                }
                createCity(getCountryId("user")) {
                    q = 10
                    r = 10
                    name = "Test City 2"
                }
            }
            endTurn()
            resolveCommands {
                createTown(getCountryId("user")) {
                    q = 11
                    r = 11
                    name = "Test Town"
                    parentCity = getCityId("Test City 1")
                }
            }
            expectCommandResolutionErrors(1, "TOWN.TARGET_TILE_OWNER")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City 1"
                    countryId = getCountryId("user")
                }
                city {
                    q = 10
                    r = 10
                    name = "Test City 2"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = gameCfg().startingAmountMoney - gameCfg().cityCost * 2 + gameCfg().cityIncomePerTurn * 2
            }
        }
    }

})