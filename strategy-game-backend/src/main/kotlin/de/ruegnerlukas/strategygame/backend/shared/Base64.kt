package de.ruegnerlukas.strategygame.backend.shared

object Base64 {

    fun toBase64(str: String) = toBase64(str.toByteArray())

    fun toBase64(bytes: ByteArray) = java.util.Base64.getEncoder().encodeToString(bytes)

    fun toUrlBase64(bytes: ByteArray) = java.util.Base64.getUrlEncoder().encodeToString(bytes)

    fun fromBase64(b64Str: String) = java.util.Base64.getDecoder().decode(b64Str).decodeToString()

    fun fromUrlBase64(b64Str: String) = java.util.Base64.getUrlDecoder().decode(b64Str).decodeToString()

}