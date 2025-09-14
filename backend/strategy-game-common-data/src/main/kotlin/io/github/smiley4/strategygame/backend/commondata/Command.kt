package io.github.smiley4.strategygame.backend.commondata


class Command<T : CommandData>(
    val id: Id,
    val game: Game.Id,
    val user: User.Id,
    val turn: Int,
    val data: T
) {

    @JvmInline
    value class Id(val value: String)

}

sealed class CommandData {

    class NoOp() : CommandData()

}
