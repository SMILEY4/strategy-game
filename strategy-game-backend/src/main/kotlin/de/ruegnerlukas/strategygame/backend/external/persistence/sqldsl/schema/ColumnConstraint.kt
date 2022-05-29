package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema

open class ColumnConstraint

class PrimaryKeyConstraint : ColumnConstraint()

class AutoIncrementPseudoConstraint : ColumnConstraint()

class NotNullConstraint : ColumnConstraint()

class UniqueConstraint : ColumnConstraint()

class ForeignKeyConstraint(val table: Table, val onDelete: OnDelete, val onUpdate: OnUpdate) : ColumnConstraint()
