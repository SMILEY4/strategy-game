package de.ruegnerlukas.strategygame.backend.common.models

data class TradeRoute(
	val srcProvinceId: String,
	val dstProvinceId: String,
	val routeIds: List<String>,
	val resourceType: ResourceType,
	val rating: Float,
	val creationTurn: Int,
	var tradedAmount: Float = 0f
)