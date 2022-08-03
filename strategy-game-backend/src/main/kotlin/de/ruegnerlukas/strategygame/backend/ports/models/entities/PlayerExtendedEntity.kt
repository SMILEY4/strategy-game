package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class PlayerExtendedEntity(
	val player: OldPlayerEntity,
	val country: CountryEntity
)
