package de.ruegnerlukas.strategygame.backend.ports.required

interface ParameterService {

    companion object {
        const val PARAM_PREFIX = "param#"
    }

    /**
     * Resolve the value of the given parameter/value
     * - if the given text starts with [PARAM_PREFIX], the value of the parameter with the name provided after [PARAM_PREFIX] will be returned
     * - if the given text does not start with [PARAM_PREFIX], the text itself will be returned untouched
     */
    fun resolveParameter(text: String): String

}