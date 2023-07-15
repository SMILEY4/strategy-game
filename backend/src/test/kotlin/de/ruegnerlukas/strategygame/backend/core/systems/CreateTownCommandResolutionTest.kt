package de.ruegnerlukas.strategygame.backend.core.systems

import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCities
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCommandResolutionErrors
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCityId
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getProvinceId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addSettlers
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings
import io.kotest.core.spec.style.StringSpec

class CreateTownCommandResolutionTest : StringSpec({

    "create towns" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addSettlers(getCountryId("user"), 10)
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            submitTurn("user") {
                createTown {
                    q = 2
                    r = 0
                    name = "Test Town 1"
                }
                createTown {
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
                town {
                    q = 2
                    r = 0
                    name = "Test Town 1"
                    countryId = getCountryId("user")
                    province = getProvinceId(getCityId("Test City"))
                }
                town {
                    q = -2
                    r = 0
                    name = "Test Town 2"
                    countryId = getCountryId("user")
                    province = getProvinceId(getCityId("Test City"))
                }
            }
        }
    }

    "create town with invalid name, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addSettlers(getCountryId("user"), 10)
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            submitTurn("user") {
                createTown {
                    q = 2
                    r = 0
                    name = "   "
                }
            }
            expectCommandResolutionErrors {
                turn = 1
                errors = listOf("CITY.NAME")
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                }
            }
        }
    }

    "create town on already occupied tile, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addSettlers(getCountryId("user"), 10)
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            submitTurn("user") {
                createTown {
                    q = 0
                    r = 1
                    name = "Test Town"
                }
            }
            expectCommandResolutionErrors {
                turn = 1
                errors = listOf("CITY.TARGET_TILE_OWNER")
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City"
                    countryId = getCountryId("user")
                }
            }
        }
    }

    "create town outside of city border, reject" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            addSettlers(getCountryId("user"), 10)
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "Test City 1"
                }
            }
            submitTurn("user") {
                createTown {
                    q = 11
                    r = 11
                    name = "Test Town"
                }
            }
            expectCommandResolutionErrors {
                turn = 1
                errors = listOf("CITY.TARGET_TILE_OWNER")
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "Test City 1"
                    countryId = getCountryId("user")
                }
            }
        }
    }

})