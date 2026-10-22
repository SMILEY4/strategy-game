package io.github.smiley4.strategygame.engine.simulation.gamestate.definitions

class DefinitionRegistry {

    object ResourceKeys {
        val FOOD = ResourceDefinition.Key("food")
        val WOOD = ResourceDefinition.Key("wood")
        val STONE = ResourceDefinition.Key("stone")
        val METAL = ResourceDefinition.Key("metal")
        val TOOLS = ResourceDefinition.Key("tools")
        val SIMPLE_CLOTHES = ResourceDefinition.Key("simple-clothes")
    }

    object PopulationClassKeys {
        val COMMONERS = PopulationClassDefinition.Key("commoners")
        val CRAFTSMEN = PopulationClassDefinition.Key("craftsmen")
    }

    object TileImprovementKeys {
        val FARMSTEAD = StructureDefinition.Key("farmstead")
        val MINE = StructureDefinition.Key("mine")
        val QUARRY = StructureDefinition.Key("quarry")
        val WOODCUTTER_CAMP = StructureDefinition.Key("woodcutter-camp")
    }

    object BuildingKeys {
        val SMITHY = StructureDefinition.Key("smithy")
        val CLOTHMAKER = StructureDefinition.Key("clothmaker")
    }

    private val populationClasses = listOf(
        PopulationClassDefinition(
            key = PopulationClassKeys.COMMONERS,
            needs = listOf(
                PopulationClassNeedDefinition.Resource(
                    resource = ResourceKeys.FOOD,
                    amount = 0.2,
                    consumptionPass = ConsumptionPassKey.PASS_0,
                    mode = ConsumptionMode.PARTIAL
                ),
                PopulationClassNeedDefinition.Resource(
                    resource = ResourceKeys.FOOD,
                    amount = 0.2,
                    consumptionPass = ConsumptionPassKey.PASS_1,
                    mode = ConsumptionMode.PARTIAL
                ),
            )
        ),
        PopulationClassDefinition(
            key = PopulationClassKeys.CRAFTSMEN,
            needs = listOf(
                PopulationClassNeedDefinition.Resource(
                    resource = ResourceKeys.FOOD,
                    amount = 0.2,
                    consumptionPass = ConsumptionPassKey.PASS_0,
                    mode = ConsumptionMode.PARTIAL
                ),
                PopulationClassNeedDefinition.Resource(
                    resource = ResourceKeys.FOOD,
                    amount = 0.2,
                    consumptionPass = ConsumptionPassKey.PASS_1,
                    mode = ConsumptionMode.PARTIAL
                ),
                PopulationClassNeedDefinition.Resource(
                    resource = ResourceKeys.SIMPLE_CLOTHES,
                    amount = 0.1,
                    consumptionPass = ConsumptionPassKey.PASS_1,
                    mode = ConsumptionMode.PARTIAL
                ),
                PopulationClassNeedDefinition.Workplace()
            )
        )
    ).associateBy { it.key }

    private val tileImprovements = listOf(
        StructureDefinition(
            key = TileImprovementKeys.FARMSTEAD,
            modules = listOf(
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("base"),
                    tier = 0,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.COMMONERS to 1,
                        ),
                    ),
                    consumptionRequirement = null,
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.FOOD to 1,
                        )
                    )
                ),
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("upgrade-1"),
                    tier = 1,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_2,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.TOOLS to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.FOOD to 1,
                        )
                    )
                )
            ),
        ),
        StructureDefinition(
            key = TileImprovementKeys.MINE,
            modules = listOf(
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("base"),
                    tier = 0,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.COMMONERS to 1,
                        ),
                    ),
                    consumptionRequirement = null,
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.METAL to 1,
                        )
                    )
                ),
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("upgrade-1"),
                    tier = 1,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_2,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.TOOLS to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.METAL to 1,
                        )
                    )
                )
            ),
        ),
        StructureDefinition(
            key = TileImprovementKeys.QUARRY,
            modules = listOf(
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("base"),
                    tier = 0,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.COMMONERS to 1,
                        ),
                    ),
                    consumptionRequirement = null,
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.STONE to 1,
                        )
                    )
                ),
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("upgrade-1"),
                    tier = 1,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_2,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.TOOLS to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.STONE to 1,
                        )
                    )
                )
            ),
        ),
        StructureDefinition(
            key = TileImprovementKeys.WOODCUTTER_CAMP,
            modules = listOf(
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("base"),
                    tier = 0,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.COMMONERS to 1,
                        ),
                    ),
                    consumptionRequirement = null,
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    )
                ),
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("upgrade-1"),
                    tier = 1,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_2,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.TOOLS to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    )
                )
            ),
        ),
    ).associateBy { it.key }

    private val buildings = listOf(
        StructureDefinition(
            key = BuildingKeys.SMITHY,
            modules = listOf(
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("base"),
                    tier = 0,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.CRAFTSMEN to 1,
                        ),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_1,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.METAL to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.TOOLS to 1,
                        )
                    )
                ),
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("upgrade-1"),
                    tier = 1,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.STONE to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.CRAFTSMEN to 1,
                        ),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_2,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                            ResourceKeys.METAL to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.TOOLS to 2,
                        )
                    )
                ),
            ),
        ),
        StructureDefinition(
            key = BuildingKeys.CLOTHMAKER,
            modules = listOf(
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("base"),
                    tier = 0,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.WOOD to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.CRAFTSMEN to 1,
                        ),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_1,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.FOOD to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.SIMPLE_CLOTHES to 1,
                        )
                    )
                ),
                StructureModuleDefinition(
                    key = StructureModuleDefinition.Key("upgrade-1"),
                    tier = 1,
                    constructionCost = ConstructionCostDefinition(
                        resources = mapOf(
                            ResourceKeys.STONE to 1,
                        )
                    ),
                    workforceRequirement = WorkforceRequirementDefinition(
                        classes = mapOf(
                            PopulationClassKeys.CRAFTSMEN to 1,
                        ),
                    ),
                    consumptionRequirement = ConsumptionRequirementDefinition(
                        consumptionPass = ConsumptionPassKey.PASS_2,
                        mode = ConsumptionMode.ALL_OR_NOTHING,
                        resources = mapOf(
                            ResourceKeys.FOOD to 1,
                        )
                    ),
                    production = ProductionDefinition(
                        resources = mapOf(
                            ResourceKeys.SIMPLE_CLOTHES to 1,
                        )
                    )
                ),
            ),
        )
    ).associateBy { it.key }


    fun get(key: StructureDefinition.Key): StructureDefinition {
        return buildings[key] ?: throw IllegalArgumentException("No building definition for $key")
    }

    fun getTileImprovementKeys() = tileImprovements.keys

    fun getBuildingKeys() = buildings.keys

    fun get(key: PopulationClassDefinition.Key): PopulationClassDefinition {
        return populationClasses[key] ?: throw IllegalArgumentException("No population class definition for $key")
    }

    fun getTilePopulationClassKeys() = populationClasses.keys

}