package io.github.smiley4.strategygame.backend.commondata

data class Realm(
    val id: Id,
    val user: User.Id
) {
    @JvmInline
    value class Id(val value: String) {
        companion object
    }
}