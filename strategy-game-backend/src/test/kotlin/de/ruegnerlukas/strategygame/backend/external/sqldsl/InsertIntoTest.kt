package de.ruegnerlukas.strategygame.backend.external.sqldsl

import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.statements.insertInto
import io.kotest.core.spec.style.StringSpec

class InsertIntoTest : StringSpec({

	"test" {

		insertInto(AttributeMeta)
			.columns(AttributeMeta.attId, AttributeMeta.name, AttributeMeta.type)
			.item {
				set(AttributeMeta.attId, "att1")
				set(AttributeMeta.name, "name1")
				set(AttributeMeta.type, "type1")
			}
			.item {
				set(AttributeMeta.attId, "att2")
				set(AttributeMeta.name, "name2")
				set(AttributeMeta.type, "type2")
			}

	}

})
