package de.ruegnerlukas.strategygame.backend.core.systems

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewRequest
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCityId
import de.ruegnerlukas.strategygame.backend.testdsl.actions.createGame
import de.ruegnerlukas.strategygame.backend.testdsl.actions.submitTurn
import de.ruegnerlukas.strategygame.backend.testdsl.gameTest
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe

class CityCreationPreviewTest : StringSpec({

    "create simple city as province capital" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            previewCity(
                userId = "user",
                cityLocation = TilePosition(0, 0),
                isProvinceCapital = true,
            ) { preview ->
                preview.addedRoutes shouldHaveSize 0
                preview.claimedTiles shouldHaveSize 37
                positionsCircle(0, 0, 3) { q, r ->
                    preview.claimedTiles.find { it.q == q && it.r == r } shouldNotBe null
                }
            }
        }
    }

    "create simple city" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            previewCity(
                userId = "user",
                cityLocation = TilePosition(0, 0),
                isProvinceCapital = false,
            ) { preview ->
                preview.addedRoutes shouldHaveSize 0
                preview.claimedTiles shouldHaveSize 7
                positionsCircle(0, 0, 1) { q, r ->
                    preview.claimedTiles.find { it.q == q && it.r == r } shouldNotBe null
                }
            }
        }
    }

    "create second city of same country" {
        gameTest {
            createGame {
                worldSettings = WorldSettings.landOnly()
                user("user")
            }
            submitTurn("user") {
                createCity {
                    q = 0
                    r = 0
                    name = "First"
                }
            }
            previewCity(
                userId = "user",
                cityLocation = TilePosition(1, 1),
                isProvinceCapital = true,
            ) { preview ->
                preview.addedRoutes shouldHaveSize 1
                preview.addedRoutes.first().also { route ->
                    route.cityIdA shouldBe "?"
                    route.cityIdB shouldBe getCityId("First")
                    route.path.map { TilePosition(it) } shouldContainExactly listOf(
                        TilePosition(1, 1),
                        TilePosition(0, 1),
                        TilePosition(0, 0)
                    )
                }
                preview.claimedTiles shouldHaveSize 22
            }
        }
    }

    "create city next to different country" {
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
                    name = "First"
                }
            }
            submitTurn("user-2")
            previewCity(
                userId = "user-2",
                cityLocation = TilePosition(2, 2),
                isProvinceCapital = true,
            ) { preview ->
                preview.addedRoutes shouldHaveSize 1
                preview.addedRoutes.first().also { route ->
                    route.cityIdA shouldBe "?"
                    route.cityIdB shouldBe getCityId("First")
                    route.path.map { TilePosition(it) } shouldContainExactly listOf(
                        TilePosition(2, 2),
                        TilePosition(1, 2),
                        TilePosition(1, 1),
                        TilePosition(1, 0),
                        TilePosition(0, 0),
                        )
                }
                preview.claimedTiles shouldHaveSize 28
            }
        }
    }

}) {

    companion object {

        suspend fun GameTestContext.previewCity(
            userId: String,
            cityLocation: TilePosition,
            isProvinceCapital: Boolean,
            block: suspend (preview: CityCreationPreviewData) -> Unit
        ) {
            val result = getActions().previewCityCreation.perform(
                getActiveGame(),
                userId,
                CityCreationPreviewRequest(
                    tile = cityLocation,
                    isProvinceCapital = isProvinceCapital
                )
            )
            when (result) {
                is Ok -> block(result.value)
                is Err -> throw Exception("City-Creation-Preview generation failed.")
            }
        }

    }

}