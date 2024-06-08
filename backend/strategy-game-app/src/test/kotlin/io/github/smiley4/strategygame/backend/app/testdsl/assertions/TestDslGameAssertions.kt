package io.github.smiley4.strategygame.backend.app.testdsl.assertions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testutils.TestUtils
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