package de.ruegnerlukas.strategygame.backend.external.sqldsl

import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.createtable.CreateTable
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe


class SQLiteCreateTableTest : StringSpec({

	"create table 'metadata'" {
		CreateTable.sqlite().build(Metadata) shouldBe
				"CREATE TABLE metadata (key TEXT NOT NULL, value TEXT, PRIMARY KEY (key, value))"
	}

	"create table 'item'" {
		CreateTable.sqlite().build(Item) shouldBe
				"CREATE TABLE item (itemId INTEGER PRIMARY KEY AUTOINCREMENT, filepath TEXT NOT NULL, timestampImported INTEGER NOT NULL, hash TEXT NOT NULL, thumbnail TEXT NOT NULL)"
	}

	"create table 'defaultAttributeValues'" {
		CreateTable.sqlite().build(DefaultAttributeValues) shouldBe
				"CREATE TABLE defaultAttribValues (attId INTEGER PRIMARY KEY REFERENCES attributeMeta ON DELETE CASCADE, attIndex INTEGER NOT NULL)"
	}

})
