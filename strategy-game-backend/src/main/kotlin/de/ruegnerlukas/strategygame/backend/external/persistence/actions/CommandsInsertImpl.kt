package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsInsert

class CommandsInsertImpl(private val database: ArangoDatabase) : CommandsInsert {

    private val metricId = MonitoringService.metricDbQuery(CommandsInsert::class)

    override suspend fun execute(commands: List<CommandEntity<*>>) {
        Monitoring.coTime(metricId) {
            database.insertDocuments(Collections.COMMANDS, commands)
        }
    }
}