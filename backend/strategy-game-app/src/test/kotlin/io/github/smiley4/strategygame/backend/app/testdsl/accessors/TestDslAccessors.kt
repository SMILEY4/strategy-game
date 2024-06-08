package io.github.smiley4.strategygame.backend.app.testdsl.accessors

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testutils.TestUtils
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.common.models.Player


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