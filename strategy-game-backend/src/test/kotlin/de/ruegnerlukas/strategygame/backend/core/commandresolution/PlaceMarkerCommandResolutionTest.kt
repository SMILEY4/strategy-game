package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.testutils.gameTest
import io.kotest.core.spec.style.StringSpec

class PlaceMarkerCommandResolutionTest : StringSpec({

    "place marker" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            resolveCommands {
                placeMarker(getCountryId("user")) {
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
            resolveCommands {
                placeMarker(getCountryId("user")) {
                    q = 4
                    r = 2
                }
                placeMarker(getCountryId("user")) {
                    q = 4
                    r = 2
                }
            }
            expectCommandResolutionErrors(0, "MARKER.TILE_SPACE")
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
            resolveCommands {
                placeMarker(getCountryId("user")) {
                    q = 99999
                    r = 99999
                }
                expectedActionError = ResolveCommandsAction.TileNotFoundError
            }
            expectNoMarkers()
        }
    }

})