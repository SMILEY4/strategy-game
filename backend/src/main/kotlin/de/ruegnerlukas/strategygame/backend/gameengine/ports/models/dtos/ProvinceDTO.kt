package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.gameengine.core.playerview.ResourceLedgerDTO

data class ProvinceDTO(
    override val dataTier0: Unit = Unit,
    override val dataTier1: ProvinceDataTier1,
    override val dataTier2: Unit = Unit,
    override val dataTier3: ProvinceDataTier3?
) : TieredDTO<Unit, ProvinceDataTier1, Unit, ProvinceDataTier3?>


data class ProvinceDataTier1(
    val id: String,
    val name: String,
    val countryId: String,
    val color: RGBColor,
    val cityIds: List<String>,
    val provinceCapitalCityId: String,
)


data class ProvinceDataTier3(
    val resourceLedger: ResourceLedgerDTO
)
