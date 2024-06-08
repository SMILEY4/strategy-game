package io.github.smiley4.strategygame.backend.common.utils

import kotlin.random.Random


object UUID {

    fun gen() = java.util.UUID.randomUUID().toString()

    fun gen(characters: Int): String = Base64.toUrlBase64(Random.nextBytes(characters))

}
