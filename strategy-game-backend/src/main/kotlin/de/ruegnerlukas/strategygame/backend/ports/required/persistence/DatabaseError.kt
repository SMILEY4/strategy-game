package de.ruegnerlukas.strategygame.backend.ports.required.persistence

sealed class DatabaseError

object EntityNotFoundError: DatabaseError()