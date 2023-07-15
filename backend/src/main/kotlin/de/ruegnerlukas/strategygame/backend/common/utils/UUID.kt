package de.ruegnerlukas.strategygame.backend.common.utils

import kotlin.random.Random


object UUID {

    fun gen() = java.util.UUID.randomUUID().toString()

    fun gen(characters: Int): String = Base64.toUrlBase64(Random.nextBytes(characters))

}
