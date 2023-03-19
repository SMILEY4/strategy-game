package de.ruegnerlukas.strategygame.backend.shared.validation



class ValidationException(val results: List<Pair<String, Boolean>>) : RuntimeException()


fun validations(failFast: Boolean, block: ValidationContext.() -> Unit): ValidationContext {
    val validationContext = ValidationContext(failFast)
    try {
        validationContext.apply(block)
    } catch (e: ValidationException) {
        return validationContext
    }
    return validationContext
}


class ValidationContext(private val failFast: Boolean) {

    val results = mutableListOf<Pair<String, Boolean>>()

    fun validate(reason: String, block: () -> Boolean) {
        val valid = block()
        results.add(reason to valid)
        if (!valid && failFast) {
            throw ValidationException(results)
        }
    }

    fun isValid() = results.all { it.second }

    fun isInvalid() = results.any { !it.second }

    fun getReasons() = results.map { it.first }

    fun getReasonsValid() = results.filter { it.second }.map { it.first }

    fun getReasonsInvalid() = results.filter { !it.second }.map { it.first }

    inline fun <T> ifValid(default: T? = null, block: () -> T): T? {
        return if (isValid()) {
            block()
        } else {
            default
        }
    }


    inline fun <T> ifInvalid(default: T? = null, block: (reasonsInvalid: List<String>) -> T): T? {
        return if (isInvalid()) {
            block(getReasonsInvalid())
        } else {
            default
        }
    }

}
