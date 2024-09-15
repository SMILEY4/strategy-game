package io.github.smiley4.strategygame.backend.ecosim.edge

/**
 * Something that produces or consumes resources.
 */
interface EconomyEntity {
    /**
     * The node owning this entity
     */
    val owner: EconomyNode


    /**
     * The configuration of this entity, i.e. how much it wants to consume and produce, its priority, etc
     */
    val config: EconomyEntityConfig


    /**
     * The current state of this entity (also see [EconomyUpdateState]). Keeps track of already consumed resources.
     */
    val state: EconomyEntityUpdateState
}