package io.github.smiley4.strategygame.backend.sessions.infrastructure

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.DbCollections
import io.github.smiley4.strategygame.backend.sessions.infrastructure.entities.CommandEntity
import io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameDbCommandsInsert

class GameDbCommandsInsertImpl(private val database: ArangoDatabase) : GameDbCommandsInsert {

    private val metricId = MetricId.query(GameDbCommandsInsertImpl::class)

    override suspend fun insert(commands: Collection<Command<*>>) {
        time(metricId) {
            database.insertDocuments(DbCollections.COMMANDS, commands.map { CommandEntity.of(it) })
        }
    }

}