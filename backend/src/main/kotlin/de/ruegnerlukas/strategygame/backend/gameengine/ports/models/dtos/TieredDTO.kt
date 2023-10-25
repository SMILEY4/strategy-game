package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

/**
 * tier 0: UNDISCOVERED, i.e, data that is always available
 * tier 1: DISCOVERED, i.e. data that is always available once discovered
 * tier 2: VISIBILE, i.e. data that is only available when visible
 * tier 3: data that is only available to the "owner"
 */
interface TieredDTO<T0, T1, T2, T3> {
    val dataTier0: T0
    val dataTier1: T1
    val dataTier2: T2
    val dataTier3: T3
}
