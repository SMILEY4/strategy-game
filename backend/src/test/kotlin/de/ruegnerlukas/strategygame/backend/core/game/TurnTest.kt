package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.testdsl.actions.connectGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectCity
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectMarkers
import de.ruegnerlukas.strategygame.backend.testdsl.assertions.expectTurn
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCountryId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.joinGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings
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