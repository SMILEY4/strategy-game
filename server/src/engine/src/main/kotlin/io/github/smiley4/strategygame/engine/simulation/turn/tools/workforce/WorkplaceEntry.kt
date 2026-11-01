package io.github.smiley4.strategygame.engine.simulation.turn.tools.workforce

import io.github.smiley4.strategygame.engine.simulation.gamestate.Entity
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.PopulationClassDefinition
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.StructureDefinition
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.StructureModuleDefinition

data class WorkplaceEntry(
    val entity: Entity.Id,
    val structure: StructureDefinition.Key,
    val module: StructureModuleDefinition.Key,
    val requiredWorkforce: Map<PopulationClassDefinition.Key, Int>,
    var assignedWorkforce: Map<PopulationClassDefinition.Key, Int>,
)