package de.ruegnerlukas.strategygame.backend.shared

object Base64 {

	fun toBase64(str: String): String {
		return java.util.Base64.getEncoder().encodeToString(str.toByteArray())
	}

	fun fromBase64(b64Str: String): String {
		return java.util.Base64.getDecoder().decode(b64Str).decodeToString()
	}

}