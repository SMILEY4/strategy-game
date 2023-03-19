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
                }
                createTown(getCountryId("user")) {
                    q = -2
                    r = 0
                    name = "Test Town 2"
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
                amount = gameCfg().startingAmountMoney - gameCfg().cityCostMoney + gameCfg().cityIncomePerTurn - gameCfg().townCostMoney * 2
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
                }
            }
            expectCommandResolutionErrors(1, "CITY.NAME")
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
                amount = gameCfg().startingAmountMoney - gameCfg().cityCostMoney + gameCfg().cityIncomePerTurn
            }
        }
    }

//    "create town without enough resources, reject" {
//        gameTest {
//            createGame {
//                worldSettings = WorldSettings.landOnly()
//                user("user")
//            }
//            resolveCommands {
//                createCity(getCountryId("user")) {
//                    q = 0
//                    r = 0
//                    name = "Test City"
//                }
//            }
//            endTurn()
//            setCountryMoney(getCountryId("user"), gameCfg().townCostMoney - 1f)
//            resolveCommands {
//                createTown(getCountryId("user")) {
//                    q = 2
//                    r = 0
//                    name = "Test City"
//                }
//            }
//            expectCommandResolutionErrors(1, "CITY.RESOURCES")
//            expectCities {
//                city {
//                    q = 0
//                    r = 0
//                    name = "Test City"
//                    countryId = getCountryId("user")
//                }
//            }
//            expectCountryMoney {
//                countryId = getCountryId("user")
//                amount = gameCfg().townCostMoney - 1f
//            }
//        }
//    }


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
                    r = 1
                    name = "Test Town"
                }
            }
            expectCommandResolutionErrors(1, "CITY.TILE_SPACE", "CITY.TARGET_TILE_OWNER")
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
                amount = gameCfg().startingAmountMoney - gameCfg().cityCostMoney + gameCfg().cityIncomePerTurn
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
            }
            endTurn()
            resolveCommands {
                createTown(getCountryId("user")) {
                    q = 11
                    r = 11
                    name = "Test Town"
                }
            }
            expectCommandResolutionErrors(1, "CITY.TARGET_TILE_OWNER")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City 1"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = gameCfg().startingAmountMoney - gameCfg().cityCostMoney + gameCfg().cityIncomePerTurn
            }
        }
    }

})