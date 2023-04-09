package de.ruegnerlukas.strategygame.backend.testdsl

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.economy.elements.nodes.ProvinceEconomyNode
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.shared.coApply
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import io.kotest.common.runBlocking

suspend fun gameTest(block: suspend GameTestContext.() -> Unit) {
    try {
    Monitoring.enabled = false
    GameTestContext().coApply(block)
    } finally {
        ProvinceEconomyNode.enablePopGrowthEntity = true
    }
}

class GameTestContext {

    private val database = runBlocking { TestUtilsFactory.createTestDatabase() }
    private val actions = TestActions.create(database)
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
