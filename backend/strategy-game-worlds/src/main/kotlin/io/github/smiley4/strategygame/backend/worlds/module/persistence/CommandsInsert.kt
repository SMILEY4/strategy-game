package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.CommandEntity


internal class CommandsInsert(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(CommandsInsert::class)

    suspend fun execute(commands: Collection<Command<*>>) {
        time(metricId) {
            database.insertDocuments(Collections.COMMANDS, commands.map { CommandEntity.of(it) })
        }
    }
}