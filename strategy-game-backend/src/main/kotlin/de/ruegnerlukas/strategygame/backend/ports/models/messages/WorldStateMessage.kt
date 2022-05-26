package de.ruegnerlukas.strategygame.backend.ports.models.messages

import de.ruegnerlukas.strategygame.backend.ports.models.world.World

data class WorldStateMessage(
    val world: World
)