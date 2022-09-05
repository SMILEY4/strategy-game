package de.ruegnerlukas.strategygame.backend.ports.provided.commands

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceScoutCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError

interface ResolvePlaceScoutCommand {

    suspend fun perform(
        command: CommandEntity<PlaceScoutCommandDataEntity>,
        game: GameExtendedEntity
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>>

}