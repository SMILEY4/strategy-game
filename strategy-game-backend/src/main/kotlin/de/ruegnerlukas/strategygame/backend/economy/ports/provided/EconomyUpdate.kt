package de.ruegnerlukas.strategygame.backend.economy.ports.provided

import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface EconomyUpdate {
    fun update(game: GameExtended)
}