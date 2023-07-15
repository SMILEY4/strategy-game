package de.ruegnerlukas.strategygame.testing.lib.build

class TestCase(
    val name: String,
    val test: suspend TestCaseContext.() -> Unit
)
