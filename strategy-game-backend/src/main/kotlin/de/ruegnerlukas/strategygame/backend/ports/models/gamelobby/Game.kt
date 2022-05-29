package de.ruegnerlukas.strategygame.backend.ports.models.gamelobby

import de.ruegnerlukas.strategygame.backend.ports.models.world.World


data class Game(
	val gameId: String,
	val participants: List<PlayerEntity>,
	val world: World,
	val commands: List<PlaceMarkerCommand>
)






