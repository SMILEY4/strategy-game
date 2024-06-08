package io.github.smiley4.strategygame.backend.app.testdsl.assertions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getGameExtended
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceStack
import io.github.smiley4.strategygame.backend.common.utils.coApply
import io.github.smiley4.strategygame.backend.engine.ports.models.Province
import io.kotest.matchers.floats.plusOrMinus
import io.kotest.matchers.shouldBe

suspend fun GameTestContext.expectProvinceResources(provinceCapitalName: String, block: suspend ProvinceResourceAssertionDsl.() -> Unit) {
    val dslConfig = ProvinceResourceAssertionDsl().coApply(block)

    val ledger = getProvince(this, provinceCapitalName).resourceLedger
    val produced = ledger.getProduced()
    val consumed = ledger.getConsumed()
    val missing = ledger.getMissing()

    dslConfig.consumed?.also { consumed.shouldHave(it) }
    dslConfig.produced?.also { produced.shouldHave(it) }
    dslConfig.missing?.also { missing.shouldHave(it) }

}

suspend fun getProvince(ctx: GameTestContext, provinceCapitalName: String): Province {
    return ctx.getGameExtended().let { game ->
        val city = game.cities.find { it.meta.name == provinceCapitalName && it.meta.isProvinceCapital }!!
        game.provinces.find { it.provinceCapitalCityId == city.cityId }!!
    }
}


class ProvinceResourceAssertionDsl {
    var consumed: List<ResourceStack>? = null
    var produced: List<ResourceStack>? = null
    var missing: List<ResourceStack>? = null
}

private infix fun ResourceCollection.shouldHave(resources: Collection<ResourceStack>) {
    ResourceCollection.basic(resources).forEach(true) { type, amount ->
        this[type] shouldBe amount.plusOrMinus(0.0001f)
    }
}
