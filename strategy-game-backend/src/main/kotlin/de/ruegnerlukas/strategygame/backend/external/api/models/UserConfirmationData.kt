package de.ruegnerlukas.strategygame.backend.external.api.models

import kotlinx.serialization.Serializable

@Serializable
data class UserConfirmationData(
	val email: String,
	val code: String
)