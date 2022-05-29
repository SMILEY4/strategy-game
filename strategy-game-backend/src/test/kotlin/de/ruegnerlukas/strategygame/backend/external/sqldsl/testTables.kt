package de.ruegnerlukas.strategygame.backend.external.sqldsl

import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.OnDelete
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.Table
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.boolean
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.integer
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.text

object Metadata : Table("metadata") {
	val key = text("key").notNull().primaryKey()
	val value = text("value").primaryKey()
}

object Item : Table("item") {
	val itemId = integer("itemId").primaryKey().autoIncrement()
	val filepath = text("filepath").notNull()
	val timestampImported = integer("timestampImported").notNull()
	val hash = text("hash").notNull()
	val thumbnail = text("thumbnail").notNull()
}

object AttributeMeta : Table("attributeMeta") {
	val attId = integer("attId").primaryKey().autoIncrement()
	val name = text("name").notNull()
	val type = text("type").notNull()
	val writable = boolean("writable").notNull()
}

object DefaultAttributeValues : Table("defaultAttribValues") {
	val attId = integer("attId").primaryKey().foreignKey(AttributeMeta, OnDelete.CASCADE)
	val attIndex = integer("attIndex").notNull()
}
