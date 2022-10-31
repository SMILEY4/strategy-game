package de.ruegnerlukas.strategygame.backend

import io.ktor.network.tls.certificates.generateCertificate
import java.io.File

/**
 * Generate a new ssl-certificate for TESTING purposes.
 */
fun main() {
    generateCertificate(
        file = File("src/main/resources/devKeystore.jks"),
        keyAlias = "strategyGame",
        keyPassword = "strategyGame",
        jksPassword = "strategyGame"
    )
}