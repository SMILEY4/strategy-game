package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.testutils.gameTest
import io.kotest.core.spec.style.StringSpec

class CreateCityCommandResolutionTest : StringSpec({

    "create city" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 4
                    r = 2
                    name = "Test City"
                }
            }
            expectCity {
                q = 4
                r = 2
                name = "Test City"
                countryId = getCountryId("user")
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = getGameConfig().startingAmountMoney - getGameConfig().cityCost
            }
        }
    }

    "create city with already existing city" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 10
                    r = 10
                    name = "First City"
                }
            }
            endTurn()
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 20
                    r = 20
                    name = "Second City"
                }
            }
            expectCities {
                city {
                    q = 10
                    r = 10
                    name = "First City"
                    countryId = getCountryId("user")
                }
                city {
                    q = 20
                    r = 20
                    name = "Second City"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = getGameConfig().startingAmountMoney - getGameConfig().cityCost * 2 + getGameConfig().cityIncomePerTurn
            }
        }
    }

    "create city on water, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.waterOnly()
                user("user")
            }
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            expectCommandResolutionErrors(0, "CITY.TARGET_TILE_TYPE")
            expectNoCities()
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = getGameConfig().startingAmountMoney
            }
        }
    }

    "create city without enough resources, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            setCountryMoney(getCountryId("user"), getGameConfig().cityCost - 1f)
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            expectCommandResolutionErrors(0, "CITY.RESOURCES")
            expectNoCities()
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = getGameConfig().cityCost - 1f
            }
        }
    }

    "create multiple cities without enough resources for all, reject second" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            setCountryMoney(getCountryId("user"), getGameConfig().cityCost + 1f)
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 10
                    r = 10
                    name = "First City"
                }
                createCity(getCountryId("user")) {
                    q = 20
                    r = 20
                    name = "Second City"
                }
            }
            expectCommandResolutionErrors(0, "CITY.RESOURCES")
            expectCities {
                city {
                    q = 10
                    r = 10
                    name = "First City"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = 1f
            }
        }
    }

    "create city on already occupied tile, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "First City"
                }
            }
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "Second City"
                }
            }
            expectCommandResolutionErrors(0, "CITY.TILE_SPACE")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "First City"
                    countryId = getCountryId("user")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user")
                amount = getGameConfig().startingAmountMoney - getGameConfig().cityCost
            }
        }
    }

    "create city on foreign tile, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user-1")
                user("user-2")
            }
            resolveCommands {
                createCity(getCountryId("user-1")) {
                    q = 0
                    r = 0
                    name = "First City"
                }
            }
            endTurn()
            resolveCommands {
                createCity(getCountryId("user-2")) {
                    q = 1
                    r = 1
                    name = "Second City"
                }
            }
            expectCommandResolutionErrors(1, "CITY.TARGET_TILE_OWNER", "CITY.COUNTRY_INFLUENCE")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "First City"
                    countryId = getCountryId("user-1")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user-1")
                amount = getGameConfig().startingAmountMoney - getGameConfig().cityCost + getGameConfig().cityIncomePerTurn
            }
            expectCountryMoney {
                countryId = getCountryId("user-2")
                amount = getGameConfig().startingAmountMoney
            }
        }
    }

    "create city without enough influence on tile, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user-1")
                user("user-2")
            }
            resolveCommands {
                createCity(getCountryId("user-1")) {
                    q = 0
                    r = 0
                    name = "First City"
                }
            }
            endTurn()
            resolveCommands {
                createCity(getCountryId("user-2")) {
                    q = 0
                    r = 4
                    name = "Second City"
                }
            }
            expectCommandResolutionErrors(1, "CITY.COUNTRY_INFLUENCE")
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "First City"
                    countryId = getCountryId("user-1")
                }
            }
            expectCountryMoney {
                countryId = getCountryId("user-1")
                amount = getGameConfig().startingAmountMoney - getGameConfig().cityCost + getGameConfig().cityIncomePerTurn
            }
            expectCountryMoney {
                countryId = getCountryId("user-2")
                amount = getGameConfig().startingAmountMoney
            }
        }
    }

})