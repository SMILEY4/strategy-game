package io.github.smiley4.strategygame.engine.simulation.gamestate.definitions

@ConsistentCopyVisibility
data class ConsumptionPassKey private constructor(val value: Int) {

    companion object {
        val PASS_0 = ConsumptionPassKey(0)
        val PASS_1 = ConsumptionPassKey(1)
        val PASS_2 = ConsumptionPassKey(2)
        val PASS_3 = ConsumptionPassKey(3)
        val PASS_4 = ConsumptionPassKey(4)
        val PASS_5 = ConsumptionPassKey(5)
        val PASS_6 = ConsumptionPassKey(6)
    }

}

enum class ConsumptionMode {
    /**
     * The module is allowed to consume only part of its required resources
     */
    PARTIAL,


    /**
     * The module must consume all of its required resources or else it will consume nothing.
     */
    ALL_OR_NOTHING,
}