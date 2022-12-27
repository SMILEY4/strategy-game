package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import kotlin.reflect.jvm.internal.impl.util.ModuleVisibilityHelper.EMPTY

data class Path(
    val tiles: List<Tile>,
) {
    companion object {
        val EMPTY = Path(emptyList())
    }
}
