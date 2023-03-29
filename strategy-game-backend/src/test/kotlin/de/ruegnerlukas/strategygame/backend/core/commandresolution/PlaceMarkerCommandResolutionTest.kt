package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCommandResolutionErrors
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectMarkers
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectNoMarkers
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import io.kotest.core.spec.style.StringSpec

class PlaceMarkerCommandResolutionTest : StringSpec({

    "place marker" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            submitTurn("user") {
                placeMarker {
                    q = 4
                    r = 2
                }
            }
            expectMarkers {
                marker {
                    q = 4
                    r = 2
                    countryId = getCountryId("user")
                }
            }
        }
    }

    "place multiple markers on same tile, reject all but the first one" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            submitTurn("user") {
                placeMarker {
                    q = 4
                    r = 2
                }
                placeMarker {
                    q = 4
                    r = 2
                }
            }
            expectCommandResolutionErrors {
                turn = 0
                errors = listOf("MARKER.TILE_SPACE")
            }
            expectMarkers {
                marker {
                    q = 4
                    r = 2
                    countryId = getCountryId("user")
                }
            }
        }
    }

    "place marker outside of map, expect correct error" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            submitTurn("user") {
                placeMarker {
                    q = 99999
                    r = 99999
                }
            }
            expectNoMarkers()
        }
    }

})