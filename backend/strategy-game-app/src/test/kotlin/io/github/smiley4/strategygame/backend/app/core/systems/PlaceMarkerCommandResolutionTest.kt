package io.github.smiley4.strategygame.backend.app.core.systems

import io.kotest.core.spec.style.StringSpec
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCountryId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.submitTurn
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCommandResolutionErrors
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectMarkers
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectNoMarkers
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.worldgen.provided.WorldGenSettings

class PlaceMarkerCommandResolutionTest : StringSpec({

    "place marker" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
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
                worldSettings = WorldGenSettings.landOnly()
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

    "place marker outside of map, expect no marker" {
        gameTest {
            createGame {
                worldSettings = WorldGenSettings.landOnly()
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