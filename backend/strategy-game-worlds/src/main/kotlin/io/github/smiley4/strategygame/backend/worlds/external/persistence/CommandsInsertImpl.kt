package io.github.smiley4.strategygame.backend.worlds.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.worlds.external.persistence.entities.CommandEntity
import io.github.smiley4.strategygame.backend.common.models.Command
import io.github.smiley4.strategygame.backend.worlds.ports.required.CommandsInsert


class CommandsInsertImpl(private val database: ArangoDatabase) : CommandsInsert {

    private val metricId = MetricId.query(CommandsInsert::class)

    override suspend fun execute(commands: Collection<Command<*>>) {
        time(metricId) {
            database.insertDocuments(Collections.COMMANDS, commands.map { CommandEntity.of(it) })
        }
    }
}