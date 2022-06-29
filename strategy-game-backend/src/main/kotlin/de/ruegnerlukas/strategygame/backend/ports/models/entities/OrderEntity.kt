package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class OrderEntity(
	val id: String,
	val playerId: String,
	val turn: Int,
	val data: String
) {

	companion object {

		data class PlaceMarkerOrderData(
			val tileId: String
		)

	}

}