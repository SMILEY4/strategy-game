package de.ruegnerlukas.strategygame.backend.core.turn

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.testutils.gameTest
import io.kotest.core.spec.style.StringSpec

class TurnTest : StringSpec({

    "submit commands, expect saved commands, ending turn and resolved commands" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user-1")
                user("user-2")
            }
			connectGame {
				userId = "user-1"
				connectionId = 1
			}
			connectGame {
				userId = "user-2"
				connectionId = 2
			}
            submitTurn("user-1") {
                placeMarker(getCountryId("user-1")) {
                    q = 4
                    r = 2
                }
                createCity(getCountryId("user-1")) {
                    q = 4
                    r = 3
                    name = "Test"
                }
            }
            expectTurn(0)
            submitTurn("user-2") {
                placeMarker(getCountryId("user-2")) {
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