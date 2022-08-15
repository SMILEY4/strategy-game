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
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnUpdateActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryByGameAndUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CountryInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameExtendedUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GameUpdateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.GamesByUserQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.ReservationInsertImpl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

object TestActions {

	fun gameCreateAction(database: ArangoDatabase) = GameCreateActionImpl(
		GameInsertImpl(database)
	)

	fun gameJoinAction(database: ArangoDatabase) = GameJoinActionImpl(
		GameQueryImpl(database),
		GameUpdateImpl(database),
		CountryInsertImpl(database)
	)

	fun gameConnectAction(database: ArangoDatabase) = GameConnectActionImpl(
		GameQueryImpl(database),
		GameUpdateImpl(database),
		BroadcastInitialGameStateActionImpl(
			GameExtendedQueryImpl(database),
			GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
		),
	)

	fun turnSubmitAction(database: ArangoDatabase) = TurnSubmitActionImpl(
		TurnEndActionImpl(
			ResolveCommandsActionImpl(
				ResolvePlaceMarkerCommandImpl(),
				ResolveCreateCityCommandImpl(
					ReservationInsertImpl(database)
				)
			),
			BroadcastTurnResultActionImpl(
				GameExtendedQueryImpl(database),
				GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
			),
			TurnUpdateActionImpl(),
			GameExtendedQueryImpl(database),
			GameExtendedUpdateImpl(database),
			CommandsByGameQueryImpl(database),
		),
		GameQueryImpl(database),
		CountryByGameAndUserQueryImpl(database),
		GameUpdateImpl(database),
		CommandsInsertImpl(database),
	)

	fun gamesListAction(database: ArangoDatabase) = GamesListActionImpl(
		GamesByUserQueryImpl(database)
	)

	fun gameRequestConnectionAction(database: ArangoDatabase) = GameRequestConnectionActionImpl(
		GameQueryImpl(database),
	)

	fun resolveCommandsAction(database: ArangoDatabase) = ResolveCommandsActionImpl(
		ResolvePlaceMarkerCommandImpl(),
		ResolveCreateCityCommandImpl(
			ReservationInsertImpl(database)
		)
	)

	fun turnEndAction(database: ArangoDatabase) = TurnEndActionImpl(
		ResolveCommandsActionImpl(
			ResolvePlaceMarkerCommandImpl(),
			ResolveCreateCityCommandImpl(
				ReservationInsertImpl(database)
			)
		),
		BroadcastTurnResultActionImpl(
			GameExtendedQueryImpl(database),
			GameMessageProducerImpl(TestUtilsFactory.MockMessageProducer()),
		),
		TurnUpdateActionImpl(),
		GameExtendedQueryImpl(database),
		GameExtendedUpdateImpl(database),
		CommandsByGameQueryImpl(database),
	)

}