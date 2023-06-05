package de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

interface ResolveProductionQueueRemoveEntryCommand {

    suspend fun perform(
        command: Command<ProductionQueueRemoveEntryCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>>

}