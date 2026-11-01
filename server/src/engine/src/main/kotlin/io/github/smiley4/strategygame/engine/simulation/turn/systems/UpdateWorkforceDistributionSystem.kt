package io.github.smiley4.strategygame.engine.simulation.turn.systems

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.DefinitionRegistry
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.PopulationClassDefinition
import io.github.smiley4.strategygame.engine.simulation.turn.tools.economy.EconomySystemBuilder
import io.github.smiley4.strategygame.engine.simulation.turn.tools.workforce.WorkplaceEntry

class UpdateWorkforceDistributionSystem(
    private val economyBuilder: EconomySystemBuilder,
    private val definitionRegistry: DefinitionRegistry
) : GameSystem {

    override fun execute(gameState: GameStateContext) {

        val economyRegions = economyBuilder.buildRegions(gameState)

        // for each economic region
        economyRegions.forEach { region ->

            // calculate total population per class in the region
            val available = mutableMapOf<PopulationClassDefinition.Key, Int>()
            region.members.forEach { member ->
                member.getComponentOrNull<EntityComponent.Population>()?.also { populationComponent ->
                    populationComponent.groups.forEach { group ->
                        available[group.classDefinition] = (available[group.classDefinition] ?: 0) + group.amount
                    }
                }
            }

            // collect workplaces
            val workplaces = mutableListOf<WorkplaceEntry>()
            region.members.forEach { member ->
                member.getComponentOrNull<EntityComponent.Structures>()?.also { structureComponent ->
                    structureComponent.instances.forEach { structure ->
                        val structureDefinition = definitionRegistry.get(structure.definition)

                        structure.modules.forEach { module ->
                            val moduleDefinition = structureDefinition.modules.first { it.key == module }

                            moduleDefinition.workforceRequirement?.also { workforceRequirement ->
                                workplaces.add(
                                    WorkplaceEntry(
                                        entity = member.id,
                                        structure = structureDefinition.key,
                                        module = moduleDefinition.key,
                                        requiredWorkforce = workforceRequirement.classes.toMap(),
                                        assignedWorkforce = emptyMap()
                                    )
                                )
                            }

                        }
                    }
                }
            }
            workplaces.sortBy { "${it.entity.id}-${it.structure.value}-${it.module.value}" }

            // assign workforce
            workplaces.forEach { workplace ->
                val hasAvailable = workplace.requiredWorkforce.all { (popClass, amount) -> (available[popClass] ?: 0) >= amount }
                if (hasAvailable) {
                    workplace.requiredWorkforce.forEach { (popClass, amount) ->
                        available[popClass] = (available[popClass] ?: 0) - amount
                        workplace.assignedWorkforce = workplace.requiredWorkforce.toMap()
                    }
                }
            }

        }

    }

}