package de.ruegnerlukas.strategygame.backend.testdsl.assertions

import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.common.coApply
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCities
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
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

private suspend fun assertCity(database: ArangoDatabase, expectedCity: CityAssertionDsl, actualCities: Collection<City>) {
    val actualCity = actualCities.find { actualCity ->
        actualCity.tile.q == expectedCity.q
                && actualCity.tile.r == expectedCity.r
                && actualCity.name == expectedCity.name
                && actualCity.countryId == expectedCity.countryId
                && actualCity.isProvinceCapital == expectedCity.isProvinceCapital
    }
    actualCity.shouldNotBeNull()
    actualCity.isProvinceCapital shouldBe expectedCity.isProvinceCapital
    if (expectedCity.province != null) {
        TestUtils.getProvinceByCityId(database, actualCity.cityId).provinceId shouldBe expectedCity.province
    }
    if(expectedCity.growthProgress != null) {
        actualCity.growthProgress shouldBe expectedCity.growthProgress!!.plusOrMinus(0.0001f)
    }
    if(expectedCity.size != null) {
        actualCity.size shouldBe expectedCity.size
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
}