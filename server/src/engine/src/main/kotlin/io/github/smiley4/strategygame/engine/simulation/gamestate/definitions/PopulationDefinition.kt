package io.github.smiley4.strategygame.engine.simulation.gamestate.definitions

class PopulationClassDefinition(

    /** A key identifying this population class. */
    val key: Key,

    /** The list of needs of this population class*/
    val needs: List<PopulationClassNeedDefinition>

) {

    data class Key(val value: String)

}

sealed interface PopulationClassNeedDefinition {

    class Resource(
        /** The resource type */
        val resource: ResourceDefinition.Key,

        /**
         * The lower amount of that resources needed per pop unit (for a stable population count).
         * Less and the population may decline.
         */
        val stableAmountLower: Double,

        /**
         * The upper amount of that resources needed per pop unit (for a stable population count)
         * More and the population may grow.
         */
        val stableAmountUpper: Double,

        /** In which pass the population will consume the resources. Lower passes/value consume first. */
        val consumptionPass: ConsumptionPassKey,

        /** The consumption behavior of the need */
        val mode: ConsumptionMode

    ) : PopulationClassNeedDefinition

    class Workplace : PopulationClassNeedDefinition


}

