package de.ruegnerlukas.strategygame.backend.testdsl.actions

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getGameExtended
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils


suspend fun GameTestContext.runEconomyUpdate() {
    val game = getGameExtended()
    if(game === getSnapshot()) {
        game.provinces.forEach { province ->
            province.resourcesProducedPrevTurn = ResourceCollection.basic(province.resourcesProducedCurrTurn)
            province.resourcesConsumedCurrTurn = ResourceCollection.basic()
            province.resourcesProducedCurrTurn = ResourceCollection.basic()
            province.resourcesMissing = ResourceCollection.basic()
        }
    }
    getActions().turnUpdate.prepare(game)
    getActions().turnUpdate.globalUpdate(game)
    TestUtils.saveGameExtended(getDb(), game)
    setSnapshot(game)
}