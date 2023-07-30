package de.ruegnerlukas.strategygame.backend.testdsl.accessors

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Player
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils


suspend fun GameTestContext.getGameExtended(): GameExtended {
    return (getSnapshot() ?: TestUtils.getGameExtended(getDb(), getActiveGame()))
}

suspend fun GameTestContext.getPlayers(): List<Player> {
    return TestUtils.getPlayers(getDb(), getActiveGame())
}

suspend fun GameTestContext.getCities(): List<City> {
    return TestUtils.getCities(getDb(), getActiveGame())
}

suspend fun GameTestContext.getCityId(cityName: String): String {
    return getCities().find { it.meta.name == cityName }!!.cityId
}

suspend fun GameTestContext.getCountryId(userId: String): String {
    return TestUtils.getCountry(getDb(), getActiveGame(), userId).countryId
}

suspend fun GameTestContext.getProvinceId(cityId: String): String {
    return TestUtils.getProvinceByCityId(getDb(), cityId).provinceId
}