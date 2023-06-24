package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsInsert

class CommandsInsertImpl(private val database: ArangoDatabase) : CommandsInsert {

    private val metricId = MonitoringService.metricDbQuery(CommandsInsert::class)

    override suspend fun execute(commands: List<Command<*>>) {
        Monitoring.coTime(metricId) {
            database.insertDocuments(Collections.COMMANDS, commands.map { CommandEntity.of(it) })
        }
    }
}