package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.commondata.CreateCityCommandData
import io.github.smiley4.strategygame.backend.commondata.DeleteMarkerCommandData
import io.github.smiley4.strategygame.backend.commondata.PlaceMarkerCommandData
import io.github.smiley4.strategygame.backend.commondata.PlaceScoutCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddBuildingEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddSettlerEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.UpgradeSettlementTierCommandData
import io.github.smiley4.strategygame.backend.engine.module.core.GameEventNode
import io.github.smiley4.strategygame.backend.engine.module.core.GameEventPublisher
import io.github.smiley4.strategygame.backend.engine.module.core.events.ResolveCommandsEvent

class ResolveCommandsStep : GameEventNode<ResolveCommandsEvent> {

    override fun handle(event: ResolveCommandsEvent, publisher: GameEventPublisher) {
        event.commands.forEach {
            when(it.data) {
                is CreateCityCommandData -> {

                    // todo
                    //  validate command
                    //  send event "ResolveCreateCity"

                    // ignore "with/without new province" for now ?

                    // VALIDATION
                    /*
                        - name
                            - must not be blank
                        - target tile
                            - must be valid type
                            - must not contain city
                            - any of
                                - already owns tile
                                - has most influence in tile
                                - nobody has more than x influence in tile
                    */
                }
                is DeleteMarkerCommandData -> {
                    // todo
                }
                is PlaceMarkerCommandData -> {
                    // todo
                }
                is PlaceScoutCommandData -> {
                    // todo
                }
                is ProductionQueueAddBuildingEntryCommandData -> {
                    // todo
                }
                is ProductionQueueAddSettlerEntryCommandData -> {
                    // todo
                }
                is ProductionQueueRemoveEntryCommandData -> {
                    // todo
                }
                is UpgradeSettlementTierCommandData -> {
                    // todo
                }
            }
        }
    }

}
