package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.BroadcastBroadcastWorldStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertCityImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertCommandsImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertMarkerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertPlayerExtendedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCommandsByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameExtendedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGamesByUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryPlayerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryPlayersByGameAndStateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryPlayersByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryTilesImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryWorldExtendedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryWorldImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdateGameTurnImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdatePlayerConnectionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdatePlayerStateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdatePlayerStatesByGameIdImpl

object TestActions {

	fun gameCreateAction(database: Database) = GameCreateActionImpl(
		InsertGameImpl(database)
	)

	fun gameJoinAction(database: Database) = GameJoinActionImpl(
		QueryGameImpl(database),
		QueryPlayerImpl(database),
		InsertPlayerExtendedImpl(database)
	)

	fun gameConnectAction(database: Database) = GameConnectActionImpl(
		BroadcastBroadcastWorldStateActionImpl(
			QueryGameExtendedImpl(
				QueryGameImpl(database),
				QueryPlayersByGameImpl(database),
				QueryWorldExtendedImpl(
					QueryWorldImpl(database),
					QueryTilesImpl(database),
				)
			),
			GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
		),
		QueryPlayerImpl(database),
		UpdatePlayerConnectionImpl(database),
	)

	fun turnSubmitAction(database: Database) = TurnSubmitActionImpl(
		TurnEndActionImpl(
			ResolveCommandsActionImpl(
				QueryWorldExtendedImpl(
					QueryWorldImpl(database),
					QueryTilesImpl(database),
				),
				InsertMarkerImpl(database),
				InsertCityImpl(database)
			),
			BroadcastBroadcastWorldStateActionImpl(
				QueryGameExtendedImpl(
					QueryGameImpl(database),
					QueryPlayersByGameImpl(database),
					QueryWorldExtendedImpl(
						QueryWorldImpl(database),
						QueryTilesImpl(database),
					)
				),
				GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
			),
			QueryGameImpl(database),
			QueryCommandsByGameImpl(database),
			UpdateGameTurnImpl(database),
			UpdatePlayerStatesByGameIdImpl(database),
		),
		QueryPlayerImpl(database),
		QueryPlayersByGameAndStateImpl(database),
		QueryGameImpl(database),
		UpdatePlayerStateImpl(database),
		InsertCommandsImpl(database),
	)

	fun gamesListAction(database: Database) = GamesListActionImpl(
		QueryGamesByUserImpl(database)
	)

	fun gameRequestConnectionAction(database: Database) = GameRequestConnectionActionImpl(
		QueryGameImpl(database),
		QueryPlayerImpl(database),
	)

}