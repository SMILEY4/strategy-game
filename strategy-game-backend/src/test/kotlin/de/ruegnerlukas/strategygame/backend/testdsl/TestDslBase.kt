package de.ruegnerlukas.strategygame.backend.testdsl

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.utils.coApply
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import io.kotest.common.runBlocking

suspend fun gameTest(fixedPopFoodConsumption: Int? = null, block: suspend GameTestContext.() -> Unit) {
    try {
    Monitoring.enabled = false
    GameTestContext(fixedPopFoodConsumption).coApply(block)
    } finally {
        ProvinceEconomyNode.enablePopGrowthEntity = true
    }
}

class GameTestContext(fixedPopFoodConsumption: Int? = null) {

    private val database = runBlocking { TestUtilsFactory.createTestDatabase() }
    private val actions = TestActions.create(database, fixedPopFoodConsumption)
    private val gameConfig = GameConfig.default()
    private var gameId: String? = null
    private var gameSnapshot: GameExtended? = null

    fun getDb() = database

    fun getActions() = actions

    fun getGameConfig() = gameConfig

    fun setActiveGame(gameId: String) {
        this.gameId = gameId
    }

    fun getActiveGame() = gameId ?: throw IllegalStateException("No game active")

    fun getActiveGameOrNull() = gameId

    fun setSnapshot(game: GameExtended) {
        gameSnapshot = game
    }

    fun getSnapshot() = gameSnapshot

}
