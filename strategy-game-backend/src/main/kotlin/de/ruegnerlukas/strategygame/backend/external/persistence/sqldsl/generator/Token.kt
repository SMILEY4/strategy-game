package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator

abstract class Token {
	abstract fun buildString(): String
}


class StringToken(private val value: String) : Token() {
	override fun buildString() = value
}


class ListToken(tokens: List<Token> = listOf()) : Token() {

	private val tokens = tokens.toMutableList()

	fun add(token: Token): ListToken {
		tokens.add(token)
		return this
	}

	fun addIf(token: Token, condition: () -> Boolean): ListToken {
		if (condition()) {
			tokens.add(token)
		}
		return this
	}

	fun add(token: String): ListToken {
		tokens.add(StringToken(token))
		return this
	}

	fun addIf(token: String, condition: () -> Boolean): ListToken {
		if (condition()) {
			tokens.add(StringToken(token))
		}
		return this
	}

	fun then(block: ListToken.() -> Unit): ListToken {
		block()
		return this
	}


	override fun buildString(): String {
		return tokens
			.filter { it !is NoOpToken }
			.map { it.buildString() }
			.joinToString(" ")
	}
}


class CsvListToken(tokens: List<Token> = listOf()) : Token() {

	private val tokens = tokens.toMutableList()

	fun add(token: Token): CsvListToken {
		tokens.add(token)
		return this
	}

	fun addIf(token: Token, condition: () -> Boolean): CsvListToken {
		if (condition()) {
			tokens.add(token)
		}
		return this
	}

	fun add(token: String): CsvListToken {
		tokens.add(StringToken(token))
		return this
	}

	fun addIf(token: String, condition: () -> Boolean): CsvListToken {
		if (condition()) {
			tokens.add(StringToken(token))
		}
		return this
	}

	override fun buildString(): String {
		return tokens
			.filter { it !is NoOpToken }
			.map { it.buildString() }
			.joinToString(", ")
	}
}


class GroupToken(private val token: Token) : Token() {
	override fun buildString(): String {
		return "(${token.buildString()})"
	}
}


class NoOpToken : Token() {
	override fun buildString(): String {
		throw UnsupportedOperationException("Cant build string of NoOp-Token")
	}
}


