package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.strategygame.backend.external.persistence.CityTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.MarkerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.UUID
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import io.kotest.core.spec.style.StringSpec

class Test : StringSpec({

	"test" {
		val db = TestUtilsFactory.createTestDatabase(false)

		val tileId0 = UUID.gen()
		val tileId1 = UUID.gen()
		val tileId2 = UUID.gen()

		db.insertBatched(
			50,
			listOf(
				TileEntity(
					id = tileId0,
					worldId = "myWorldId",
					q = 0,
					r = 0,
					type = "LAND"
				),
				TileEntity(
					id = tileId1,
					worldId = "myWorldId",
					q = 1,
					r = 0,
					type = "LAND"
				),
				TileEntity(
					id = tileId2,
					worldId = "myWorldId",
					q = 0,
					r = 1,
					type = "LAND"
				)
			)
		) { batch ->
			SQL
				.insert()
				.into(TileTbl)
				.columns(TileTbl.id, TileTbl.worldId, TileTbl.q, TileTbl.r, TileTbl.type)
				.items(batch.map {
					SQL.item()
						.set(TileTbl.id, it.id)
						.set(TileTbl.worldId, it.worldId)
						.set(TileTbl.q, it.q)
						.set(TileTbl.r, it.r)
						.set(TileTbl.type, it.type)
				})
		}

		db
			.startInsert {
				SQL
					.insert()
					.into(CityTbl)
					.columns(CityTbl.id, CityTbl.tileId)
					.items(
						SQL.item()
							.set(CityTbl.id, UUID.gen())
							.set(CityTbl.tileId, tileId2)
					)
			}
			.execute()

		db
			.startInsert {
				SQL
					.insert()
					.into(CityTbl)
					.columns(CityTbl.id, CityTbl.tileId)
					.items(
						SQL.item()
							.set(CityTbl.id, UUID.gen())
							.set(CityTbl.tileId, tileId0)
					)
			}
			.execute()

		db
			.startInsert {
				SQL
					.insert()
					.into(MarkerTbl)
					.columns(MarkerTbl.id, MarkerTbl.tileId, MarkerTbl.playerId)
					.items(
						SQL.item()
							.set(MarkerTbl.id, UUID.gen())
							.set(MarkerTbl.tileId, tileId2)
							.set(MarkerTbl.playerId, UUID.gen())
					)
			}
			.execute()

	}

})