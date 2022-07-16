package de.ruegnerlukas.strategygame.backend.external.persistence.actions.gameext

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ExtGameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext.ExtGameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker.MarkersQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TilesQueryByGame

class ExtGameQueryImpl(
	private val gameQuery: GameQuery,
	private val tilesQuery: TilesQueryByGame,
	private val markersQuery: MarkersQueryByGame,
	private val playerQuery: PlayerQueryByGame
) : ExtGameQuery {

	override suspend fun execute(gameId: String, include: ExtGameQuery.Include): Either<DatabaseError, ExtGameEntity> {
		return either {
			val game = gameQuery.execute(gameId).bind()
			val tiles = when (include.includeTiles) {
				true -> tilesQuery.execute(gameId).bind()
				false -> listOf()
			}
			val markers = when (include.includeMarkers) {
				true -> markersQuery.execute(gameId).bind()
				false -> listOf()
			}
			val players = when (include.includePlayers) {
				true -> playerQuery.execute(gameId).bind()
				false -> listOf()
			}
			ExtGameEntity(
				id = game.id,
				seed = game.seed,
				turn = game.turn,
				tiles = tiles,
				markers = markers,
				players = players
			)
		}
	}

}