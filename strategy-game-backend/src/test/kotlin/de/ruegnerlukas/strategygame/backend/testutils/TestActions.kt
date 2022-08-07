package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCommandsActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolveCreateCityCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.commands.ResolvePlaceMarkerCommandImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.BroadcastInitialGameStateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.BroadcastTurnResultActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertCommandsImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertCountryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.InsertGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCommandsByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCountryByGameAndUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameExtendedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryGamesByUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdateGameExtendedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.UpdateGameImpl
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

object TestActions {

	fun gameCreateAction(database: ArangoDatabase) = GameCreateActionImpl(
		InsertGameImpl(database)
	)

	fun gameJoinAction(database: ArangoDatabase) = GameJoinActionImpl(
		QueryGameImpl(database),
		UpdateGameImpl(database),
		InsertCountryImpl(database)
	)

	fun gameConnectAction(database: ArangoDatabase) = GameConnectActionImpl(
		QueryGameImpl(database),
		UpdateGameImpl(database),
		BroadcastInitialGameStateActionImpl(
			QueryGameExtendedImpl(database),
			GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
		),
	)

	fun turnSubmitAction(database: ArangoDatabase) = TurnSubmitActionImpl(
		TurnEndActionImpl(
			ResolveCommandsActionImpl(
				QueryGameExtendedImpl(database),
				UpdateGameExtendedImpl(database),
				ResolvePlaceMarkerCommandImpl(),
				ResolveCreateCityCommandImpl()
			),
			BroadcastTurnResultActionImpl(
				QueryGameExtendedImpl(database),
				GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
			),
			QueryGameImpl(database),
			UpdateGameImpl(database),
			QueryCommandsByGameImpl(database),
		),
		QueryGameImpl(database),
		QueryCountryByGameAndUserImpl(database),
		UpdateGameImpl(database),
		InsertCommandsImpl(database),
	)

	fun gamesListAction(database: ArangoDatabase) = GamesListActionImpl(
		QueryGamesByUserImpl(database)
	)

	fun gameRequestConnectionAction(database: ArangoDatabase) = GameRequestConnectionActionImpl(
		QueryGameImpl(database),
	)

	fun resolveCommandsAction(database: ArangoDatabase) = ResolveCommandsActionImpl(
		QueryGameExtendedImpl(database),
		UpdateGameExtendedImpl(database),
		ResolvePlaceMarkerCommandImpl(),
		ResolveCreateCityCommandImpl()
	)

}