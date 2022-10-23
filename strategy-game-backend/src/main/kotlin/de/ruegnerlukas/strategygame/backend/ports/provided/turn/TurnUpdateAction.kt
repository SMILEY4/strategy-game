package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

interface TurnUpdateAction {

	fun perform(game: GameExtended)

}