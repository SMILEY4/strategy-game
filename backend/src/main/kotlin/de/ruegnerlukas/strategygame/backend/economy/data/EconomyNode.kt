package de.ruegnerlukas.strategygame.backend.economy.data

/**
 * Something that "owns" resources, e.g. a city, province, market-area, country, ...
 */
interface EconomyNode {

    companion object {
        /**
         * @return all entities in this subtree, i.e. all entities of this node, its child nodes and their children
         */
        fun EconomyNode.collectEntities(): Collection<EconomyEntity> = getEntities() + getChildren().flatMap { it.collectEntities() }


        /**
         * @return the whole subtree, i.e. this node, its children and their children
         */
        fun EconomyNode.collectNodes(): Collection<EconomyNode> = listOf(this) + getChildren().flatMap { it.collectNodes() }
    }


    /**
     * @return the resources currently stored/available in this node
     */
    fun getStorage(): EconomyNodeStorage


    /**
     * @return the child nodes
     */
    fun getChildren(): Collection<EconomyNode>


    /**
     * the entities at this node
     */
    fun getEntities(): Collection<EconomyEntity>

}

