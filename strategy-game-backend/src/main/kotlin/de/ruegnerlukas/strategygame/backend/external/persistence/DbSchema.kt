package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.kdbl.dsl.expression.AliasTable
import de.ruegnerlukas.kdbl.dsl.expression.RefAction
import de.ruegnerlukas.kdbl.dsl.expression.Table
import de.ruegnerlukas.kdbl.dsl.expression.TableLike

object DbSchema {
	suspend fun createTables(db: Database) {
		db.startCreate(SQL.createIfNotExists(GameTbl)).execute()
		db.startCreate(SQL.createIfNotExists(PlayerTbl)).execute()
		db.startCreate(SQL.createIfNotExists(OrderTbl)).execute()
		db.startCreate(SQL.createIfNotExists(TileTbl)).execute()
		db.startCreate(SQL.createIfNotExists(MarkerTbl)).execute()
	}
}


object GameTbl : GameTableDef()

sealed class GameTableDef : Table("game", true) {
	val id = text("id").primaryKey()
	val seed = integer("seed")
	val turn = integer("turn")

	companion object {
		class GameTableDefAlias(override val table: TableLike, override val alias: String) : GameTableDef(), AliasTable
	}

	override fun alias(alias: String) = GameTableDefAlias(this, alias)

}


object PlayerTbl : PlayerTableDef()

sealed class PlayerTableDef : Table("player", true) {
	val id = text("id").primaryKey()
	val userId = text("userId")
	val gameId = text("gameId").foreignKey(GameTbl.id, onDelete = RefAction.CASCADE)
	val connectionId = integer("connectionId").nullable()
	val state = text("state")

	companion object {
		class PlayerTableDefAlias(override val table: TableLike, override val alias: String) : PlayerTableDef(), AliasTable
	}

	override fun alias(alias: String) = PlayerTableDefAlias(this, alias)

}


object OrderTbl : OrderTableDef()

sealed class OrderTableDef : Table("player_order", true) {
	val id = text("id").primaryKey()
	val playerId = text("playerId").foreignKey(PlayerTbl.id, onDelete = RefAction.CASCADE)
	val turn = integer("turn")
	val data = text("data")

	companion object {
		class OrderTableDefAlias(override val table: TableLike, override val alias: String) : OrderTableDef(), AliasTable
	}

	override fun alias(alias: String) = OrderTableDefAlias(this, alias)

}


object TileTbl : TileTableDef()

sealed class TileTableDef : Table("tile", true) {
	val id = text("id").primaryKey()
	val gameId = text("gameId").foreignKey(GameTbl.id, onDelete = RefAction.CASCADE)
	val q = integer("q")
	val r = integer("r")
	val type = text("type")

	companion object {
		class TileTableDefAlias(override val table: TableLike, override val alias: String) : TileTableDef(), AliasTable
	}

	override fun alias(alias: String) = TileTableDefAlias(this, alias)

}


object MarkerTbl : MarkerTableDef()

sealed class MarkerTableDef : Table("marker", true) {
	val id = text("id").primaryKey()
	val tileId = text("tileId").foreignKey(TileTbl.id, onDelete = RefAction.CASCADE)
	val playerId = text("playerId").foreignKey(PlayerTbl.id, onDelete = RefAction.CASCADE)

	companion object {
		class MarkerTableDefAlias(override val table: TableLike, override val alias: String) : MarkerTableDef(), AliasTable
	}

	override fun alias(alias: String) = MarkerTableDefAlias(this, alias)

}