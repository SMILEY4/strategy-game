package io.github.smiley4.strategygame.engine.simulation.turn.tools.economy

import io.github.smiley4.strategygame.engine.simulation.gamestate.EntityComponent
import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.DefinitionRegistry
import io.github.smiley4.strategygame.engine.simulation.gamestate.definitions.PopulationClassNeedDefinition

class EconomySystemBuilder(private val definitionRegistry: DefinitionRegistry) {

    fun buildRegions(gameState: GameStateContext): List<EconomicRegion> {
        return gameState.entities
            .filter {
                val hierarchyComponent = it.getComponentOrNull<EntityComponent.RealmHierarchy>()
                hierarchyComponent != null && hierarchyComponent.administeredBy == null
            }
            .map { regionAdmin ->
                EconomicRegion(
                    members = gameState.entities.filter { entity ->
                        val hierarchyComponent = entity.getComponentOrNull<EntityComponent.RealmHierarchy>()
                        hierarchyComponent != null && (entity.id == regionAdmin.id || hierarchyComponent.administeredBy == regionAdmin.id)
                    },
                    storedResources = mutableMapOf(),
                )
            }
    }

    fun buildActivities(region: EconomicRegion): EconomicActivitiesContainer {
        val activities = EconomicActivitiesContainer()

        region.members.forEach { member ->

            member.getComponentOrNull<EntityComponent.Population>()?.also { componentPopulation ->

                componentPopulation.groups.forEach { group ->
                    val populationClassDefinition = definitionRegistry.get(group.classDefinition)

                    populationClassDefinition.needs.forEach { need ->
                        when (need) {
                            is PopulationClassNeedDefinition.Resource -> activities.add(
                                EconomicActivity(
                                    source = EconomicSource.PopulationGroupNeed(
                                        entity = member.id,
                                        popClass = group.classDefinition,
                                        popNeed = need.key,
                                    ),
                                    consumption = EconomicActivity.Consumption(
                                        resources = mapOf(need.resource to need.amount.toFloat()),
                                        mode = need.mode,
                                        pass = need.consumptionPass
                                    ),
                                    production = null
                                )
                            )
                            is PopulationClassNeedDefinition.Workplace -> Unit
                        }
                    }

                }
            }

            member.getComponentOrNull<EntityComponent.Structures>()?.also { componentStructures ->

                componentStructures.instances.forEach { structure ->
                    val structureDefinition = definitionRegistry.get(structure.definition)

                    structure.modules.forEach { module ->
                        val moduleDefinition = structureDefinition.modules.first { it.key == module }
                        EconomicActivity(
                            source = EconomicSource.StructureModule(
                                entity = member.id,
                                structure = structure.definition,
                                module = module,
                            ),
                            consumption = moduleDefinition.consumptionRequirement?.let {
                                EconomicActivity.Consumption(
                                    resources = it.resources.mapValues { v -> v.value.toFloat() },
                                    mode = it.mode,
                                    pass = it.consumptionPass
                                )
                            },
                            production = null
                        )
                    }
                }
            }

        }

        return activities
    }

}