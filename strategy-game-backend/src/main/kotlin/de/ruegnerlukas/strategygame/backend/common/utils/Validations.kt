package de.ruegnerlukas.strategygame.backend.common.utils

fun validations(block: Validations.() -> Unit): Validations {
    val validations = Validations().apply(block)
    return validations
}


class Validations {

    private val results = mutableMapOf<String, Boolean>()


    fun mustBeTrue(code: String, block: () -> Boolean) {
        val valid = block()
        results[code] = valid
    }

    fun mustBeFalse(code: String, block: () -> Boolean) {
        val valid = !block()
        results[code] = valid
    }

    fun isValid() = results.values.all { true }

    fun isInvalid() = results.values.any { false }

    fun getValidCodes(): Set<String> = results.filter { it.value }.map { it.key }.toSet()

    fun getInvalidCodes(): Set<String> = results.filter { !it.value }.map { it.key }.toSet()


}