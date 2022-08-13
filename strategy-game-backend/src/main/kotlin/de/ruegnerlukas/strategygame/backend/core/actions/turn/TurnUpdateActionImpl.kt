package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction

class TurnUpdateActionImpl : TurnUpdateAction {

	companion object {
		private const val CITY_INCOME = 10.0f
	}

	override fun perform(game: GameExtendedEntity) {
		game.cities.forEach { city -> addMoney(game, city.countryId, CITY_INCOME) }
	}

	private fun addMoney(game: GameExtendedEntity, countryId: String, amount: Float) {
		game.countries.find { it.key == countryId }?.let { it.resources.money += amount }
	}

}