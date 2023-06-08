package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

data class TradeRouteDTO(
	val srcProvinceId: String,
	val dstProvinceId: String,
	val routeIds: List<String>,
	val resourceType: ResourceType,
	val rating: Float,
	val creationTurn: Int,
)