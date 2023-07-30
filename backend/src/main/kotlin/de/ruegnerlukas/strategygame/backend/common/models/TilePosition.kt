package de.ruegnerlukas.strategygame.backend.common.models

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef

data class TilePosition(
    var q: Int,
    var r: Int
) {
    constructor(pos: TilePosition) : this(pos.q, pos.r)

    constructor(ref: TileRef) : this(ref.q, ref.r)

}
