package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.kdbl.dsl.expression.AutoIncrementProperty
import de.ruegnerlukas.kdbl.dsl.expression.ForeignKeyConstraint
import de.ruegnerlukas.kdbl.dsl.expression.PrimaryKeyProperty
import de.ruegnerlukas.kdbl.dsl.expression.Table
import de.ruegnerlukas.strategygame.backend.external.persistence.CityTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.CountryTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.CommandTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldTbl

fun main() {
	println(
		PlantUmlERDiagramGenerator().generate(
			listOf(
				GameTbl,
				PlayerTbl,
				CommandTbl,
				WorldTbl,
				TileTbl,
				MarkerTbl,
				CountryTbl,
				CityTbl
			)
		)
	)
}

interface ERDiagramGenerator {
	fun generate(tables: List<Table>): String
}

class PlantUmlERDiagramGenerator : ERDiagramGenerator {

	override fun generate(tables: List<Table>): String {
		val builder = StringBuilder()
		builder.appendLine("@startuml")
		builder.appendLine("hide circle")
//		builder.appendLine("skinparam linetype ortho")

		val entities = generateEntities(tables)
		builder.appendLine(entities.joinToString("\n"))

		val relations = generateRelations(tables)
		builder.appendLine(relations.joinToString("\n"))

		builder.appendLine("@enduml")

		return builder.toString()
	}


	private fun generateEntities(tables: List<Table>): List<String> {
		val entities = mutableListOf<String>()
		tables.forEach { table ->
			val builder = StringBuilder()
			builder.appendLine("entity \"${table.tableName}\" {")
			table.getColumns().forEach { column ->
				val props = mutableListOf<String>()
				column.getProperties().forEach { property ->
					when (property) {
						is PrimaryKeyProperty -> props.add("PK")
						is ForeignKeyConstraint -> props.add("FK")
						is AutoIncrementProperty -> props.add("AINC")
					}
				}
				val strProps = if (props.isEmpty()) {
					""
				} else {
					"<<${props.joinToString(",")}>>"
				}
				builder.append("   ").appendLine("*${column.columnName}: ${column.type} $strProps")
			}
			builder.appendLine("}")
			entities.add(builder.toString())
		}
		return entities
	}

	private fun generateRelations(tables: List<Table>): List<String> {
		val relations = mutableListOf<String>()
		tables.forEach { table ->
			table.getColumns().forEach { column ->
				column.getProperties().forEach { property ->
					if (property is ForeignKeyConstraint) {
						relations.add("${table.tableName} --> ${property.table.tableName}")
					}
				}
			}
		}
		return relations;
	}

}


class MermaidERDiagramGenerator : ERDiagramGenerator {

	override fun generate(tables: List<Table>): String {
		val builder = StringBuilder()
		builder.appendLine("erDiagram")

		val entities = generateEntities(tables)
		builder.appendLine(entities.joinToString("\n"))

		val relations = generateRelations(tables)
		builder.appendLine(relations.joinToString("\n"))

		return builder.toString()
	}


	private fun generateEntities(tables: List<Table>): List<String> {
		val entities = mutableListOf<String>()

		tables.forEach { table ->
			val builder = StringBuilder()
			builder.appendLine("${table.tableName} {")

			table.getColumns().forEach { column ->
				val strProps = column.getProperties()
					.map { property ->
						when (property) {
							is PrimaryKeyProperty -> "PK"
							is ForeignKeyConstraint -> "FK"
							is AutoIncrementProperty -> "AINC"
							else -> null
						}
					}
					.filterNotNull()
					.joinToString(",")
				builder.append("   ").appendLine("${column.columnName} ${column.type} $strProps")
			}

			builder.appendLine("}")
			entities.add(builder.toString())
		}
		return entities
	}

	private fun generateRelations(tables: List<Table>): List<String> {
		val relations = mutableListOf<String>()
		tables.forEach { table ->
			table.getColumns().forEach { column ->
				column.getProperties().forEach { property ->
					if (property is ForeignKeyConstraint) {
						relations.add("${table.tableName} ||--o{ ${property.table.tableName}: ref")
					}
				}
			}
		}
		return relations;
	}

}

