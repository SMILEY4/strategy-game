package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayersByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryTiles
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryWorld
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryWorldExtended

class QueryWorldExtendedImpl(
	private val queryWorld: QueryWorld,
	private val queryPlayers: QueryPlayersByGame,
	private val queryTiles: QueryTiles,
) : QueryWorldExtended {

	override suspend fun execute(gameId: String, worldId: String): Either<EntityNotFoundError, WorldExtendedEntity> {
		return either {
			val world = queryWorld.execute(worldId).bind()
			val players = queryPlayers.execute(gameId)
			val tiles = queryTiles.execute(worldId)
			WorldExtendedEntity(
				id = world.id,
				players = players,
				tiles = tiles,
				cities = listOf(), // TODO(),
				countries = listOf() //  TODO()
			)
		}
	}

}