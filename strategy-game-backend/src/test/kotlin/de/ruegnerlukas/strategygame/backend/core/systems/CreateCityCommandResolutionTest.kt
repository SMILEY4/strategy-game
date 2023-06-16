package de.ruegnerlukas.strategygame.backend.core.systems

import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCities
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCity
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCommandResolutionErrors
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectNoCities
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import de.ruegnerlukas.strategygame.backend.testdsl.modifiers.addSettlers
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings
import io.kotest.core.spec.style.StringSpec

class CreateCityCommandResolutionTest : StringSpec({

    "create city" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
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
                worldSettings = WorldSettings.landOnly()
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
                worldSettings = WorldSettings.landOnly()
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
                worldSettings = WorldSettings.landOnly()
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
                worldSettings = WorldSettings.waterOnly()
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
                worldSettings = WorldSettings.landOnly()
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
                worldSettings = WorldSettings.landOnly()
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
                worldSettings = WorldSettings.landOnly()
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