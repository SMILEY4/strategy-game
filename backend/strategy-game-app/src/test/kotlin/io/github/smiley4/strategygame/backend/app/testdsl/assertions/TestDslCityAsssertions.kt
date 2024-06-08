package io.github.smiley4.strategygame.backend.app.testdsl.assertions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCities
import io.github.smiley4.strategygame.backend.app.testutils.TestUtils
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.utils.coApply
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.SettlementTier
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.floats.plusOrMinus
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe

suspend fun GameTestContext.expectNoCities() {
    expectCities { }
}


suspend fun GameTestContext.expectCities(
    expectation: ElementExpectation = ElementExpectation.EXACTLY,
    block: suspend CitiesAssertionDsl.() -> Unit
) {
    val dslConfig = CitiesAssertionDsl().coApply(block)
    val expectedCities = dslConfig.cities
    getCities().also { actualCities ->
        if (expectation == ElementExpectation.EXACTLY) {
            actualCities shouldHaveSize expectedCities.size
        }
        expectedCities.forEach { expectedCity ->
            assertCity(getDb(), expectedCity, actualCities)
        }
    }
}

suspend fun GameTestContext.expectCity(block: suspend CityAssertionDsl.() -> Unit) {
    val dslConfig = CityAssertionDsl(true).coApply(block)
    getCities().also { actualCities ->
        assertCity(getDb(), dslConfig, actualCities)
    }
}

private suspend fun assertCity(
    database: ArangoDatabase,
    expectedCity: CityAssertionDsl,
    actualCities: Collection<City>
) {
    val actualCity = actualCities.find { actualCity ->
        actualCity.tile.q == expectedCity.q
                && actualCity.tile.r == expectedCity.r
                && actualCity.meta.name == expectedCity.name
                && actualCity.countryId == expectedCity.countryId
                && actualCity.meta.isProvinceCapital == expectedCity.isProvinceCapital
    }
    actualCity.shouldNotBeNull()
    actualCity.meta.isProvinceCapital shouldBe expectedCity.isProvinceCapital
    if (expectedCity.province != null) {
        TestUtils.getProvinceByCityId(database, actualCity.cityId).provinceId shouldBe expectedCity.province
    }
    if (expectedCity.growthProgress != null) {
        actualCity.population.growthProgress shouldBe expectedCity.growthProgress!!.plusOrMinus(0.0001f)
    }
    if (expectedCity.size != null) {
        actualCity.population.size shouldBe expectedCity.size
    }
    if (expectedCity.tier != null) {
        actualCity.tier shouldBe expectedCity.tier
    }
}

class CitiesAssertionDsl {
    val cities = mutableListOf<CityAssertionDsl>()
    suspend fun city(block: suspend CityAssertionDsl.() -> Unit) {
        cities.add(CityAssertionDsl(true).coApply(block))
    }

    suspend fun town(block: suspend CityAssertionDsl.() -> Unit) {
        cities.add(CityAssertionDsl(false).coApply(block))
    }
}

class CityAssertionDsl(
    val isProvinceCapital: Boolean
) {
    var q: Int? = null
    var r: Int? = null
    var name: String? = null
    var countryId: String? = null
    var province: String? = null
    var growthProgress: Float? = null
    var size: Int? = null
    var tier: SettlementTier? = null
}