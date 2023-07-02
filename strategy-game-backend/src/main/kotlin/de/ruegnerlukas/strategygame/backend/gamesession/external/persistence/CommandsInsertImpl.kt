package de.ruegnerlukas.strategygame.backend.gamesession.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gamesession.external.persistence.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Command
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsInsert

class CommandsInsertImpl(private val database: ArangoDatabase) : CommandsInsert {

    private val metricId = MetricId.query(CommandsInsert::class)

    override suspend fun execute(commands: Collection<Command<*>>) {
        time(metricId) {
            database.insertDocuments(Collections.COMMANDS, commands.map { CommandEntity.of(it) })
        }
    }
}