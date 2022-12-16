package de.ruegnerlukas.strategygame.backend.ports.required

interface ParameterService {

    companion object {
        const val PARAM_PREFIX = "param#"
    }

    /**
     * Resolve the value of the given parameter.
     * If the name is a reference to a parameter, the key of the parameter must follow a [PARAM_PREFIX] (e.g. param#path.to.my.param)
     * Return:
     * - if the given name starts with [PARAM_PREFIX], the value of the parameter with the key provided after [PARAM_PREFIX] will be returned
     * - if the given name does not start with [PARAM_PREFIX], the name itself will be returned as value untouched
     * @param name the name of the parameter (or the value itself)
     * @return the resolved value or the name itself
     */
    fun resolveParameter(name: String): String

}