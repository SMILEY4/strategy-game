package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity

interface TurnUpdateAction {

	fun perform(game: GameExtendedEntity)

}