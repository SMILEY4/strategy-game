package de.ruegnerlukas.strategygame.backend.testdsl.assertions

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceStack
import de.ruegnerlukas.strategygame.backend.common.utils.coApply
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getGameExtended
import io.kotest.matchers.floats.plusOrMinus
import io.kotest.matchers.shouldBe

suspend fun GameTestContext.expectProvinceResources(provinceCapitalName: String, block: suspend ProvinceResourceAssertionDsl.() -> Unit) {
    val dslConfig = ProvinceResourceAssertionDsl().coApply(block)
    val province = getProvince(this, provinceCapitalName)
    dslConfig.producedLastTurn?.also { province shouldHaveProducedLastTurn it }
    dslConfig.consumedThisTurn?.also { province shouldHaveConsumedCurrentTurn it }
    dslConfig.producedThisTurn?.also { province shouldHaveProducedCurrentTurn it }
    dslConfig.missing?.also { province shouldBeMissing it }
}

suspend fun getProvince(ctx: GameTestContext, provinceCapitalName: String): Province {
    return ctx.getGameExtended().let { game ->
        val city = game.cities.find { it.meta.name == provinceCapitalName && it.meta.isProvinceCapital }!!
        game.provinces.find { it.provinceCapitalCityId == city.cityId }!!
    }
}


class ProvinceResourceAssertionDsl {
    var producedLastTurn: List<ResourceStack>? = null
    var producedThisTurn: List<ResourceStack>? = null
    var consumedThisTurn: List<ResourceStack>? = null
    var missing: List<ResourceStack>? = null
}

private infix fun Province.shouldHaveProducedLastTurn(resources: Collection<ResourceStack>) {// TODO
//    ResourceCollection.basic(resources).forEach(true) { type, amount ->
//        this.resourcesProducedPrevTurn[type] shouldBe amount.plusOrMinus(0.0001f)
//    }
}

private infix fun Province.shouldHaveProducedCurrentTurn(resources: Collection<ResourceStack>) {// TODO
//    ResourceCollection.basic(resources).forEach(true) { type, amount ->
//        this.resourcesProducedCurrTurn[type] shouldBe amount.plusOrMinus(0.0001f)
//    }
}

private infix fun Province.shouldHaveConsumedCurrentTurn(resources: Collection<ResourceStack>) {// TODO
//    ResourceCollection.basic(resources).forEach(true) { type, amount ->
//        this.resourcesConsumedCurrTurn[type] shouldBe amount.plusOrMinus(0.0001f)
//    }
}

private infix fun Province.shouldBeMissing(resources: Collection<ResourceStack>) {// TODO
//    ResourceCollection.basic(resources).forEach(true) { type, amount ->
//        this.resourcesMissing[type] shouldBe amount.plusOrMinus(0.0001f)
//    }
}

private infix fun ResourceCollection.shouldBeExactly(resources: Collection<ResourceStack>) {// TODO
//    ResourceCollection.basic(resources).forEach(true) { type, amount ->
//        this[type] shouldBe amount.plusOrMinus(0.0001f)
//    }
}