package io.github.smiley4.strategygame.backend.app.testdsl.actions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getGameExtended
import io.github.smiley4.strategygame.backend.app.testutils.TestUtils
import io.github.smiley4.strategygame.backend.engine.core.gamestep.TriggerGlobalUpdate


suspend fun GameTestContext.runEconomyUpdate() {
    val game = getGameExtended()
    if (game === getSnapshot()) {
        // TODO
//        game.provinces.forEach { province ->
//            province.resourcesProducedPrevTurn = ResourceCollection.basic(province.resourcesProducedCurrTurn)
//            province.resourcesConsumedCurrTurn = ResourceCollection.basic()
//            province.resourcesProducedCurrTurn = ResourceCollection.basic()
//            province.resourcesMissing = ResourceCollection.basic()
//        }
    }
    getActions().gameEventSystem.publish(TriggerGlobalUpdate, game)
    TestUtils.saveGameExtended(getDb(), game)
    setSnapshot(game)
}