package io.github.smiley4.strategygame.backend.common.utils

import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import kotlin.random.Random


object Id {

    fun gen(): String = java.util.UUID.randomUUID().toString()

    fun gen(characters: Int): String = Base64.toUrlBase64(Random.nextBytes(characters))

}


fun Tile.Id.Companion.gen() = Tile.Id(Id.gen())

fun WorldObject.Id.Companion.gen() = WorldObject.Id(Id.gen())

fun Realm.Id.Companion.gen() = Realm.Id(Id.gen())
