package io.github.smiley4.strategygame.backend.worlds.module.core.required

import io.github.smiley4.strategygame.backend.commondata.Command


interface CommandsInsert {
	suspend fun execute(commands: Collection<Command<*>>)
}