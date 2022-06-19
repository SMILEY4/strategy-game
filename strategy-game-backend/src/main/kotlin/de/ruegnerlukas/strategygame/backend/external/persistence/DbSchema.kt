package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.kdbl.dsl.expression.AliasTable
import de.ruegnerlukas.kdbl.dsl.expression.RefAction
import de.ruegnerlukas.kdbl.dsl.expression.Table
import de.ruegnerlukas.kdbl.dsl.expression.TableLike

object DbSchema {
	fun createTables(db: Database) {
		db.startCreate(SQL.create(GameTbl))
		db.startCreate(SQL.create(ParticipantTbl))
		db.startCreate(SQL.create(OrderTbl))
		db.startCreate(SQL.create(TileTbl))
		db.startCreate(SQL.create(MarkerTbl))
	}
}

object GameTbl : GameTableDef()

sealed class GameTableDef : Table("game") {
	val gameId = text("gameId").notNull().primaryKey()

	companion object {
		class GameTableDefAlias(override val table: TableLike, override val alias: String) : GameTableDef(), AliasTable
	}

	override fun alias(alias: String) = GameTableDefAlias(this, alias)

}


object ParticipantTbl : ParticipantTableDef()

sealed class ParticipantTableDef : Table("participant") {
	val participantId = text("participantId").notNull().primaryKey()
	val userId = text("userId").notNull()
	val gameId = text("gameId").notNull().foreignKey(GameTbl.gameId, onDelete = RefAction.CASCADE)

	companion object {
		class ParticipantTableDefAlias(override val table: TableLike, override val alias: String) : ParticipantTableDef(), AliasTable
	}

	override fun alias(alias: String) = ParticipantTableDefAlias(this, alias)

}


object OrderTbl : OrderTableDef()

sealed class OrderTableDef : Table("order") {
	val orderId = text("orderId").primaryKey()
	val userId = text("userId").notNull()
	val gameId = text("gameId").notNull().foreignKey(GameTbl.gameId, onDelete = RefAction.CASCADE)
	val data = text("data").notNull()
	val turn = integer("turn")

	companion object {
		class OrderTableDefAlias(override val table: TableLike, override val alias: String) : OrderTableDef(), AliasTable
	}

	override fun alias(alias: String) = OrderTableDefAlias(this, alias)

}


object TileTbl : TileTableDef()

sealed class TileTableDef : Table("tile") {
	val tileId = text("tileId").notNull().primaryKey()
	val q = integer("q").notNull()
	val r = integer("r").notNull()
	val gameId = text("gameId").notNull().foreignKey(GameTbl.gameId, onDelete = RefAction.CASCADE)

	companion object {
		class TileTableDefAlias(override val table: TableLike, override val alias: String) : TileTableDef(), AliasTable
	}

	override fun alias(alias: String) = TileTableDefAlias(this, alias)

}


object MarkerTbl : MarkerTableDef()

sealed class MarkerTableDef : Table("marker") {
	val markerId = text("markerId").notNull().primaryKey()
	val tileId = text("tileId").notNull().foreignKey(TileTbl.tileId)
	val playerId = text("playerId").notNull().foreignKey(ParticipantTbl.participantId)

	companion object {
		class MarkerTableDefAlias(override val table: TableLike, override val alias: String) : MarkerTableDef(), AliasTable
	}

	override fun alias(alias: String) = MarkerTableDefAlias(this, alias)

}