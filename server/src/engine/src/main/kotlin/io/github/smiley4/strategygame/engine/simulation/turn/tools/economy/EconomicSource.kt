package io.github.smiley4.strategygame.engine.simulation.turn.tools.economy

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.PopulationClassDefinition
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.PopulationClassNeedDefinition
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.StructureDefinition
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.StructureModuleDefinition

sealed interface EconomicSource {

    data class PopulationGroupNeed(
        val entity: Entity.Id,
        val popClass: PopulationClassDefinition.Key,
        val popNeed: PopulationClassNeedDefinition.Key
    ) : EconomicSource

    data class StructureModule(
        val entity: Entity.Id,
        val structure: StructureDefinition.Key,
        val module: StructureModuleDefinition.Key
    ) : EconomicSource

}