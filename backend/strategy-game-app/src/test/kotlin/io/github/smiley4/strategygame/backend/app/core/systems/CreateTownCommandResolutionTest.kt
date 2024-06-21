package io.github.smiley4.strategygame.backend.app.core.systems

import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCityId
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCities
import io.kotest.core.spec.style.StringSpec
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCountryId
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getProvinceId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.submitTurn
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCommandResolutionErrors
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addSettlers
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings

class CreateTownCommandResolutionTest : StringSpec({

    "create towns" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
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
                worldSettings = WorldGenSettings.landOnly()
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
                worldSettings = WorldGenSettings.landOnly()
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
                worldSettings = WorldGenSettings.landOnly()
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