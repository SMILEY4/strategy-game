package de.ruegnerlukas.strategygame.testing.lib.build

open class TestGroup(
    context: TestGroupContext.() -> Unit
) {
    val name = this::class.simpleName
    val testcases = TestGroupContext().apply(context).getTestCases()
}
