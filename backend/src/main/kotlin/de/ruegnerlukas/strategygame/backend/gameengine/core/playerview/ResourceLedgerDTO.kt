package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.detaillog.dto.DetailLogEntryDTO
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerDetailType

data class ResourceLedgerDTO(
    val entries: List<ResourceLedgerEntryDTO>
)

data class ResourceLedgerEntryDTO(
    val resourceType: ResourceType,
    val amount: Float,
    val missing: Float,
    val details: List<DetailLogEntryDTO<ResourceLedgerDetailType>>
)

