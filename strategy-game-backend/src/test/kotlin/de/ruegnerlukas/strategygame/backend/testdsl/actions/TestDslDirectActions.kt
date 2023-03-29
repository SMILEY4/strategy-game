package de.ruegnerlukas.strategygame.backend.testdsl.actions

import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getGameExtended
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils


suspend fun GameTestContext.runEconomyUpdate() {
    val game = getGameExtended()
    getActions().turnUpdate.prepare(game)
    getActions().turnUpdate.globalUpdate(game)
    TestUtils.saveGameExtended(getDb(), game)
    setSnapshot(game)
}