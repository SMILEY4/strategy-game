package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.strategygame.backend.app.Config
import io.ktor.network.tls.certificates.generateCertificate
import java.io.File

/**
 * Generate a new ssl-certificate for TESTING purposes.
 */
fun main() {
    Config.load("dev")
    generateCertificate(
        file = File(Config.get().ktor.security.ssl.keyStore),
        keyAlias = Config.get().ktor.security.ssl.keyAlias,
        keyPassword = Config.get().ktor.security.ssl.privateKeyPassword,
        jksPassword = Config.get().ktor.security.ssl.keyStorePassword
    )
}