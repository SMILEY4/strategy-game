package de.ruegnerlukas.strategygame.backend.ports.models.messages

import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile

data class WorldStateMessage(
    val tiles: List<Tile>
)