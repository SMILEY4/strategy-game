package io.github.smiley4.strategygame.backend.app.testdsl

import io.github.smiley4.strategygame.backend.app.testutils.TestActions
import io.github.smiley4.strategygame.backend.app.testutils.TestUtilsFactory
import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring
import io.github.smiley4.strategygame.backend.common.monitoring.NoOpMonitoringService
import io.github.smiley4.strategygame.backend.common.utils.coApply
import io.github.smiley4.strategygame.backend.engine.core.eco.node.ProvinceEconomyNode
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.kotest.common.runBlocking

suspend fun gameTest(fixedPopFoodConsumption: Int? = null, block: suspend GameTestContext.() -> Unit) {
    try {
        Monitoring.service = NoOpMonitoringService()
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
