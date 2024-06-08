package io.github.smiley4.strategygame.backend.worlds.ports.required

import io.github.smiley4.strategygame.backend.common.models.Command


interface CommandsInsert {
	suspend fun execute(commands: Collection<Command<*>>)
}