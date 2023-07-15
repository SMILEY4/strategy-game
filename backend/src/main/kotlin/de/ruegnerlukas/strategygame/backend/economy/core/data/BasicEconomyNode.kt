package de.ruegnerlukas.strategygame.backend.economy.core.data

open class BasicEconomyNode(
    private val storage: EconomyNodeStorage,
    nodeFactory: (nodes: MutableList<EconomyNode>, owner: EconomyNode) -> Unit,
    entityFactory: (entities: MutableList<EconomyEntity>, owner: EconomyNode) -> Unit
) : EconomyNode {

    private val nodes = mutableListOf<EconomyNode>().also { nodeFactory(it, this) }
    private val entities = mutableListOf<EconomyEntity>().also { entityFactory(it, this) }

    override fun getStorage(): EconomyNodeStorage = storage
    override fun getChildren(): Collection<EconomyNode> = nodes
    override fun getEntities(): Collection<EconomyEntity> = entities
}