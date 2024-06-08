package io.github.smiley4.strategygame.backend.app.core.game

import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCountryId
import io.github.smiley4.strategygame.backend.app.testdsl.actions.connectGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.createGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.joinGame
import io.github.smiley4.strategygame.backend.app.testdsl.actions.submitTurn
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectCity
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectMarkers
import io.github.smiley4.strategygame.backend.app.testdsl.assertions.expectTurn
import io.github.smiley4.strategygame.backend.app.testdsl.gameTest
import io.github.smiley4.strategygame.backend.worldgen.WorldSettings
import io.kotest.core.spec.style.StringSpec

class TurnTest : StringSpec({

    "submit commands, expect saved commands, ending turn and resolved commands" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
            }
            joinGame("user-1")
            joinGame("user-2")
            connectGame("user-1") {
                connectionId = 1
            }
            connectGame("user-2") {
                connectionId = 2
            }
            submitTurn("user-1") {
                placeMarker {
                    q = 4
                    r = 2
                }
                createCity {
                    q = 4
                    r = 3
                    name = "Test"
                }
            }
            expectTurn(0)
            submitTurn("user-2") {
                placeMarker {
                    q = 0
                    r = 0
                }
            }
            expectTurn(1)
            expectCity {
                q = 4
                r = 3
                name = "Test"
                countryId = getCountryId("user-1")
            }
            expectMarkers {
                marker {
                    q = 4
                    r = 2
                    countryId = getCountryId("user-1")
                }
                marker {
                    q = 0
                    r = 0
                    countryId = getCountryId("user-2")
                }
            }
        }
    }

})