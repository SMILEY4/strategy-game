package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity

data class Game(
    var turn: Int,
    val players: MutableList<Player>
) : DbEntity()

