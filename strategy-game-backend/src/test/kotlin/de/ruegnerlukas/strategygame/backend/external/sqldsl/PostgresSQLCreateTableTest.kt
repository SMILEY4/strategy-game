package de.ruegnerlukas.strategygame.backend.external.sqldsl

import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.createtable.CreateTable
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe

class PostgresSQLCreateTableTest : StringSpec({

	"create table 'metadata'" {
		CreateTable.postgreSql().build(Metadata) shouldBe
				"CREATE TABLE metadata (key TEXT NOT NULL, value TEXT, PRIMARY KEY (key, value))"
	}

	"create table 'item'" {
		CreateTable.postgreSql()
			.build(Item) shouldBe
				"CREATE TABLE item (itemId SERIAL PRIMARY KEY, filepath TEXT NOT NULL, timestampImported INTEGER NOT NULL, hash TEXT NOT NULL, thumbnail TEXT NOT NULL)"
	}

	"create table 'defaultAttributeValues'" {
		CreateTable.postgreSql().build(DefaultAttributeValues) shouldBe
				"CREATE TABLE defaultAttribValues (attId INTEGER PRIMARY KEY REFERENCES attributeMeta ON DELETE CASCADE, attIndex INTEGER NOT NULL)"
	}

})
