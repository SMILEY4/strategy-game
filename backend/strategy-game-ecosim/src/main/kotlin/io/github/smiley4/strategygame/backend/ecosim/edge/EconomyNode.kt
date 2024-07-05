package io.github.smiley4.strategygame.backend.ecosim.edge

/**
 * Something that "owns" resources, e.g. a city, province, market-area, country, ...
 */
interface EconomyNode {

    companion object {
        /**
         * @return all entities in this subtree, i.e. all entities of this node, its child nodes and their children
         */
        fun EconomyNode.collectEntities(): Collection<EconomyEntity> = entities + children.flatMap { it.collectEntities() }


        /**
         * @return the whole subtree as a flat list, i.e. this node, its children and their children
         */
        fun EconomyNode.collectNodes(): Collection<EconomyNode> = listOf(this) + children.flatMap { it.collectNodes() }


        /**
         * @return whether the given node is this node or a node in the subtree with this node as root
         */
        fun EconomyNode.contains(node: EconomyNode): Boolean {
            return if (this == node) {
                true
            } else {
                this.children.any { it.contains(node) }
            }
        }

    }


    /**
     * @return the resources currently stored/available in this node
     */
    val storage: EconomyNodeStorage


    /**
     * @return the child nodes
     */
    val children: Collection<EconomyNode>


    /**
     * the entities at this node
     */
    val entities: Collection<EconomyEntity>

}

