package io.github.smiley4.strategygame.engine.simulation.gamestate.definitions


class StructureDefinition(
    /** A key identifying this structure definition */
    val key: Key,

    /** A list of modules of the structure. Must have at least one module with tier 0. All module key withing a structure must be unique. */
    val modules: List<StructureModuleDefinition>

) {
    data class Key(val value: String)
}

class StructureModuleDefinition(

    /** A key identifying this module definition within the structure. */
    val key: Key,

    /**
     * The tier of the module. Initial tier is "0". A structure can only have one module of the same tier.
     * Higher tier modules require all lower tier modules to exist first before constructing them.
     */
    val tier: Int,

    /** The cost of constructing this module. The initial structure cost is that of the tier 0 module. */
    val constructionCost: ConstructionCostDefinition,

    /** The required workforce to run this module at full efficiency */
    val workforceRequirement: WorkforceRequirementDefinition?,

    /** Depend on another module within the same structure. */
    val moduleDependency: Key?,

    /** The things this module needs to consume each turn to be active. */
    val consumptionRequirement: ConsumptionRequirementDefinition?,

    /** The things this module produces each turn when active */
    val production: ProductionDefinition,

    val storageCapacity: Map<ResourceDefinition.Key, Float>
) {
    data class Key(val value: String)
}

class ConstructionCostDefinition(
    /** The required resources and amount */
    val resources: Map<ResourceDefinition.Key, Int>
)

class WorkforceRequirementDefinition(
    /** The required population classes and amount */
    val classes: Map<PopulationClassDefinition.Key, Int>
)

class ConsumptionRequirementDefinition(

    /** In which pass the module will consume resources. Lower passes/value consume first. */
    val consumptionPass: ConsumptionPassKey,

    /** The consumption behavior of the module */
    val mode: ConsumptionMode,

    /** The required resources and amount */
    val resources: Map<ResourceDefinition.Key, Int>,
)

class ProductionDefinition(
    /** The produced resources and amount */
    val resources: Map<ResourceDefinition.Key, Int>,
)


class StorageDefinition(

    /** The allowed resources with max limit */
    val resourcesAllowed: Map<ResourceDefinition.Key, Int?>?,

    /** The banned resources. */
    val resourcesBanned: Set<ResourceDefinition.Key>?,
)