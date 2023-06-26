package de.ruegnerlukas.strategygame.backend.testdsl.assertions

import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe

fun GameTestContext.expectCommandResolutionErrors(block: CommandResolutionErrorsAssertionDsl.() -> Unit) {
    val dslConfig = CommandResolutionErrorsAssertionDsl().apply(block)
    val errors = getActions().context.commandResolutionErrors[dslConfig.turn] ?: emptyList()
    errors shouldContainExactlyInAnyOrder (dslConfig.errors ?: emptyList())
}

class CommandResolutionErrorsAssertionDsl {
    var turn: Int? = null
    var errors: Collection<String>? = null
}

suspend fun GameTestContext.expectTurn(turn: Int) {
    TestUtils.getGame(getDb(), getActiveGame()).turn shouldBe turn
}