package io.github.smiley4.strategygame.backend.common.utils

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

    fun isValid() = results.values.all { it }

    fun isInvalid() = results.values.any { !it }

    fun getValidCodes(): Set<String> = results.filter { it.value }.map { it.key }.toSet()

    fun getInvalidCodes(): Set<String> = results.filter { !it.value }.map { it.key }.toSet()


}