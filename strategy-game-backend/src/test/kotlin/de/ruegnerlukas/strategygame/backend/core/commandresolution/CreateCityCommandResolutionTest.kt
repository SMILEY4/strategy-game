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
        }
    }

    "create two cities next to each other in the same turn, create one" {
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
                    name = "City 1"
                }
                createCity(getCountryId("user-2")) {
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
            resolveCommands {
                createCity(getCountryId("user")) {
                    q = 0
                    r = 0
                    name = "   "
                }
            }
            expectCommandResolutionErrors(0, "CITY.NAME")
            expectNoCities()
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
            expectCommandResolutionErrors(0, "CITY.TILE_SPACE", "CITY.TARGET_TILE_OWNER")
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
        }
    }

})