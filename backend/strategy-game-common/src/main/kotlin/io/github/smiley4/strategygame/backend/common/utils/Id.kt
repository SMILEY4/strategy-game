package io.github.smiley4.strategygame.backend.common.utils

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import kotlin.random.Random


object Id {

    fun gen() = java.util.UUID.randomUUID().toString()

    fun gen(characters: Int): String = Base64.toUrlBase64(Random.nextBytes(characters))

}


fun Country.Id.Companion.gen() = Country.Id(Id.gen())

fun WorldObject.Id.Companion.gen() = WorldObject.Id(Id.gen())

fun Settlement.Id.Companion.gen() = Settlement.Id(Id.gen())

fun Province.Id.Companion.gen() = Province.Id(Id.gen())

fun ProductionQueueEntry.Id.Companion.gen() = ProductionQueueEntry.Id(Id.gen())