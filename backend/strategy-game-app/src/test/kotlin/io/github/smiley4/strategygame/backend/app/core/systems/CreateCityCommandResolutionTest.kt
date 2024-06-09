package io.github.smiley4.strategygame.backend.app.core.systems

import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCities
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCity
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectNoCities
import io.kotest.core.spec.style.StringSpec
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCountryId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.submitTurn
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCommandResolutionErrors
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.app.testdsl.modifiers.addSettlers
import io.github.smiley4.strategygame.backend.worldgen.provided.WorldGenSettings

class CreateCityCommandResolutionTest : StringSpec({

    "create city" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            submitTurn("user") {
                createCity {
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
        }
    }

    "create city with already existing city" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addSettlers(getCountryId("user"), 2)
            submitTurn("user") {
                createCity {
                    q = 10
                    r = 10
                    name = "First City"
                }
            }
            expectCity {
                q = 10
                r = 10
                name = "First City"
                countryId = getCountryId("user")
            }
            submitTurn("user") {
                createCity {
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
        }
    }

    "create two cities next to each other in the same turn, expect only created one" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user-1")
                user("user-2")
            }
            submitTurn("user-1") {
                createCity {
                    q = 0
                    r = 0
                    name = "City 1"
                }
            }
            submitTurn("user-2") {
                createCity {
                    q = 1
                    r = 0
                    name = "City 2"
                }
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "City 1"
                    countryId = getCountryId("user-1")
                }
            }
        }
    }

    "create city with invalid name, reject" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "    "
                }
            }
            expectCommandResolutionErrors {
                turn = 0
                errors = listOf("CITY.NAME")
            }
            expectNoCities()
        }
    }

    "create city on water, reject" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.waterOnly()
                user("user")
            }
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "Test City"
                }
            }
            expectCommandResolutionErrors {
                turn = 0
                errors = listOf("CITY.TARGET_TILE_TYPE")
            }
            expectNoCities()
        }
    }

    "create city on already occupied tile, reject" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user")
            }
            addSettlers(getCountryId("user"), 2)
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "First City"
                }
            }
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "Second City"
                }
            }
            expectCommandResolutionErrors {
                turn = 1
                errors = listOf("CITY.TILE_SPACE", "CITY.TARGET_TILE_OWNER")
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "First City"
                    countryId = getCountryId("user")
                }
            }
        }
    }

    "create city on foreign tile, reject" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user-1")
                user("user-2")
            }
            submitTurn("user-1") {
                createCity {
                    q = 0
                    r = 0
                    name = "First City"
                }
            }
            submitTurn("user-2")
            submitTurn("user-1")
            submitTurn("user-2") {
                createCity {
                    q = 1
                    r = 1
                    name = "Second City"
                }
            }
            expectCommandResolutionErrors {
                turn = 1
                errors = listOf("CITY.TARGET_TILE_OWNER", "CITY.COUNTRY_INFLUENCE")
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "First City"
                    countryId = getCountryId("user-1")
                }
            }
        }
    }

    "create city without enough influence on tile, reject" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
                user("user-1")
                user("user-2")
            }
            submitTurn("user-1") {
                createCity {
                    q = 0
                    r = 0
                    name = "First City"
                }
            }
            submitTurn("user-2")
            submitTurn("user-1")
            submitTurn("user-2") {
                createCity {
                    q = 0
                    r = 4
                    name = "Second City"
                }
            }
            expectCommandResolutionErrors {
                turn = 1
                errors = listOf("CITY.COUNTRY_INFLUENCE")
            }
            expectCities {
                city {
                    q = 0
                    r = 0
                    name = "First City"
                    countryId = getCountryId("user-1")
                }
            }
        }
    }

})