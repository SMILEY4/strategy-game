package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.kdbl.dsl.expression.AliasTable
import de.ruegnerlukas.kdbl.dsl.expression.RefAction
import de.ruegnerlukas.kdbl.dsl.expression.Table
import de.ruegnerlukas.kdbl.dsl.expression.TableLike

object DbSchema {
	suspend fun createTables(db: Database) {
		listOf(
			GameTbl,
			PlayerTbl,
			CommandTbl,
			TileTbl,
			MarkerTbl,
			CountryTbl,
			CityTbl
		).forEach { db.startCreate(SQL.createIfNotExists(it)).execute() }
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


object CommandTbl : CommandTableDef()

sealed class CommandTableDef : Table("commands", true) {
	val id = text("id").primaryKey()
	val playerId = text("playerId").foreignKey(PlayerTbl.id, onDelete = RefAction.CASCADE)
	val turn = integer("turn")
	val type = text("type")
	val data = text("data")

	companion object {
		class CommandTableDefAlias(override val table: TableLike, override val alias: String) : CommandTableDef(), AliasTable
	}

	override fun alias(alias: String) = CommandTableDefAlias(this, alias)

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


object CountryTbl : CountryTableDef()

sealed class CountryTableDef : Table("country", true) {
	val id = text("id").primaryKey()
	val playerId = text("playerId").foreignKey(PlayerTbl.id, onDelete = RefAction.CASCADE)
	val amountMoney = float("amountMoney")

	companion object {
		class CountryTableDefAlias(override val table: TableLike, override val alias: String) : CountryTableDef(), AliasTable
	}

	override fun alias(alias: String) = CountryTableDefAlias(this, alias)

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


object CityTbl : CityTableDef()

sealed class CityTableDef : Table("city", true) {
	val id = text("id").primaryKey()
	val countryId = text("countryId").foreignKey(CountryTbl.id, onDelete = RefAction.CASCADE)
	val tileId = text("tileId").foreignKey(TileTbl.id, onDelete = RefAction.CASCADE)

	companion object {
		class CityTableDefAlias(override val table: TableLike, override val alias: String) : MarkerTableDef(), AliasTable
	}

	override fun alias(alias: String) = CityTableDefAlias(this, alias)

}