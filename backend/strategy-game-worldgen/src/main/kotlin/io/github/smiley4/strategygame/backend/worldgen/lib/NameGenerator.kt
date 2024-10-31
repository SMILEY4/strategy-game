package io.github.smiley4.strategygame.backend.worldgen.lib

/**
 * Procedurally generates names
 */
interface NameGenerator {

    /**
     * Generate a pseudo-random name for a settlement.
     */
    fun generateSettlementName(): String

}