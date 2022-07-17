package de.ruegnerlukas.strategygame.backend.external.persistence.actions.world

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.country.CountriesQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkersQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.world.WorldQuery

class WorldQueryImpl(
	private val queryTiles: TilesQueryByGame,
	private val queryMarkers: MarkersQueryByGame,
	private val queryCountries: CountriesQueryByGame,
) : WorldQuery {

	override suspend fun execute(gameId: String): Either<DatabaseError, WorldEntity> {
		return either {
			val tiles = queryTiles.execute(gameId).bind()
			val markers = queryMarkers.execute(gameId).bind()
			val countries = queryCountries.execute(gameId).bind()
			WorldEntity(
				tiles = tiles,
				markers = markers,
				countries = countries
			)
		}
	}

}