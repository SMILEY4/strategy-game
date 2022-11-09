package de.ruegnerlukas.strategygame.ecosim.simulation

import de.ruegnerlukas.strategygame.ecosim.world.World

data class SimContext(
    var tick: Int,
    val world: World
)