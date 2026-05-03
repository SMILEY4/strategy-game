package io.github.smiley4.strategygame.identity.shared

import java.security.SecureRandom
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * Creates secure passwords from unsafe ones
 */
internal class PasswordHasher {

    /**
     * Generate a safe hashed password from the given raw value
     */
    fun hash(unsafe: UnsafePassword): HashedPassword {
        return this.hash(unsafe, generateSalt())
    }

    /**
     * Generate a safe hashed password from the given raw value and salt
     */
    fun hash(unsafe: UnsafePassword, salt: String): HashedPassword {
        return this.generateHash(unsafe, salt.chunked(2).map { it.toInt(16).toByte() }.toByteArray())
    }

    /**
     * Generate a safe hashed password from the given raw value and salt
     */
    fun hash(unsafe: UnsafePassword, salt: ByteArray): HashedPassword {
        return this.generateHash(unsafe, salt)
    }

    /**
     * Generate a safe hash from the given secret and salt.
     */
    private fun generateHash(secret: UnsafePassword, salt: ByteArray): HashedPassword {
        val spec = PBEKeySpec(secret.value.toCharArray(), salt, 65536, 128)
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512")
        val hash = factory.generateSecret(spec).encoded.toHexString()
        return HashedPassword(
            hash = "\$pbkdf2\$$hash",
            salt = salt.toHexString()
        )
    }


    /**
     * Generate a secure hash.
     */
    private fun generateSalt(): ByteArray {
        val salt = ByteArray(16)
        SecureRandom().nextBytes(salt)
        return salt
    }

}