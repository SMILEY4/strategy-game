package io.github.smiley4.strategygame.engine.simulation.gamestate.definitions

class PopulationClassDefinition(

    /** A key identifying this population class. */
    val key: Key,

    /** The list of needs of this population class*/
    val needs: List<PopulationClassNeedDefinition>

) {

    data class Key(val value: String)

}

sealed class PopulationClassNeedDefinition(
    val key: Key
) {

    data class Key(val value: String)

    class Resource(

        key: Key,

        /** The resource type */
        val resource: ResourceDefinition.Key,

        /**
         * The amount of that resource needed per pop unit.
         */
        val amountPerPop: Double,

        /** In which pass the population will consume the resources. Lower passes/value consume first. */
        val consumptionPass: ConsumptionPassKey,

        /** The consumption behavior of the need */
        val mode: ConsumptionMode

    ) : PopulationClassNeedDefinition(key)

    class Workplace(key: Key) : PopulationClassNeedDefinition(key)


}

