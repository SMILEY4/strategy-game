package de.ruegnerlukas.strategygame.backend.testdsl

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.shared.coApply
import de.ruegnerlukas.strategygame.backend.testutils.TestActionsCollection
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import io.kotest.common.runBlocking

suspend fun gameTest(block: suspend GameTestContext.() -> Unit) {
    Monitoring.enabled = false
    GameTestContext().coApply(block)
}

class GameTestContext {

    private val database = runBlocking { TestUtilsFactory.createTestDatabase() }
    private val actions = TestActionsCollection.create(database)
    private val gameConfig = GameConfig.default()
    private var gameId: String? = null

    fun getDb() = database

    fun getActions() = actions

    fun getGameConfig() = gameConfig

    fun setActiveGame(gameId: String) {
        this.gameId = gameId
    }

    fun getActiveGame() = gameId ?: throw IllegalStateException("No game active")

    fun getActiveGameOrNull() = gameId

}
