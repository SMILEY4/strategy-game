package de.ruegnerlukas.strategygame.backend.external.persistence.arango

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import com.arangodb.ArangoDBException
import com.arangodb.DbName
import com.arangodb.async.ArangoCollectionAsync
import com.arangodb.async.ArangoDBAsync
import com.arangodb.async.ArangoDatabaseAsync
import com.arangodb.mapping.ArangoJack
import com.arangodb.model.DocumentCreateOptions
import com.arangodb.model.OverwriteMode
import com.fasterxml.jackson.module.kotlin.KotlinModule
import kotlinx.coroutines.future.await

class ArangoDatabase(val database: ArangoDatabaseAsync) {

	companion object {

		/**
		 * Create a new database instance with the given host, port and credentials.
		 * If no database with the given name exists, a new one will be created
		 */
		suspend fun create(host: String, port: Int, username: String?, password: String?, name: String): ArangoDatabase {
			val arango = getArango(host, port, username, password)
			val database = arango.db(DbName.of(name))
			if (!database.exists().await()) {
				database.create().await()
			}
			return ArangoDatabase(database)
		}


		/**
		 * Delete the database at the given host and port with the given name
		 */
		suspend fun delete(host: String, port: Int, username: String?, password: String?, name: String) {
			val arango = getArango(host, port, username, password)
			val database = arango.db(DbName.of(name))
			if (database.exists().await()) {
				database.drop().await()
			}
		}

		private fun getArango(host: String, port: Int, username: String?, password: String?): ArangoDBAsync {
			return ArangoDBAsync.Builder()
				.serializer(ArangoJack().apply {
					configure { it.registerModule(KotlinModule.Builder().build()) }
				})
				.host(host, port)
				.let {
					if (username != null && password != null) {
						it.user(username).password(password)
					} else {
						it
					}
				}.build()
		}

		private val INSERT_OPTIONS = DocumentCreateOptions().also {
			it.overwriteMode(OverwriteMode.conflict)
		}

		private val INSERT_OR_REPLACE_OPTIONS = DocumentCreateOptions().also {
			it.overwriteMode(OverwriteMode.replace)
		}
	}


	private val collections = mutableMapOf<String, ArangoCollectionAsync>()


	private suspend fun getCollection(name: String): ArangoCollectionAsync {
		var collection = collections[name]
		if (collection == null) {
			collection = database.collection(name)
			if (!collection.exists().await()) {
				collection.create().await()
			}
			collections[name] = collection
			return collection
		} else {
			return collection
		}
	}


	suspend fun assertCollections(vararg collectionNames: String) {
		collectionNames.forEach { getCollection(it) }
	}


	/**
	 * Insert the given document into the given collection.
	 * @return the [DocumentHandle] or an [UniqueConstraintViolationError], if a document with the same key already exists
	 */
	suspend fun <T> insertDocument(collection: String, value: T): Either<UniqueConstraintViolationError, DocumentHandle> {
		try {
			return getCollection(collection)
				.insertDocument(value, INSERT_OPTIONS)
				.await()
				.let { DocumentHandle(id = it.id, key = it.key, rev = it.rev) }
				.right()
		} catch (e: ArangoDBException) {
			return when (e.errorNum) {
				1210 -> UniqueConstraintViolationError.left()
				else -> throw e
			}
		}
	}


	/**
	 * Insert the given documents into the given collection.
	 * @return a [DocumentHandle]s for each successfully inserted document.
	 */
	suspend fun <T> insertDocuments(collection: String, values: List<T>): List<DocumentHandle> {
		if (values.isNotEmpty()) {
			return getCollection(collection)
				.insertDocuments(values, INSERT_OPTIONS)
				.await()
				.let { result -> result.documents.map { DocumentHandle(id = it.id, key = it.key, rev = it.rev) } }
		} else {
			return emptyList()
		}
	}


	/**
	 * Insert the given document into the given collection. If a document with the same key already exists, it will be overwritten
	 * @return the [DocumentHandle]
	 */
	suspend fun <T> insertOrReplaceDocument(collection: String, value: T): DocumentHandle {
		return getCollection(collection)
			.insertDocument(value, INSERT_OR_REPLACE_OPTIONS)
			.await()
			.let { DocumentHandle(id = it.id, key = it.key, rev = it.rev) }
	}


	/**
	 * Insert the given document into the given collection. If a document with the same key already exists, it will be overwritten
	 * @return the [DocumentHandle]s for each successfully inserted or replaced document.
	 */
	suspend fun <T> insertOrReplaceDocuments(collection: String, values: List<T>): List<DocumentHandle> {
		if (values.isNotEmpty()) {
			return getCollection(collection)
				.insertDocuments(values, INSERT_OR_REPLACE_OPTIONS)
				.await()
				.let { result -> result.documents.map { DocumentHandle(id = it.id, key = it.key, rev = it.rev) } }
		} else {
			return emptyList()
		}
	}


	/**
	 * Get the document with the given key from the given collection as the given type.
	 * @return the document or [DocumentNotFoundError] if the document does not exist
	 */
	suspend fun <T> getDocument(collection: String, key: String, type: Class<T>): Either<DocumentNotFoundError, T> {
		return getCollection(collection).getDocument(key, type).await()
			?.right()
			?: DocumentNotFoundError.left()
	}


	/**
	 * Get the documents with the given keys from the given collection as the given type.
	 * @return the successfully found documents
	 */
	suspend fun <T> getDocuments(collection: String, keys: Collection<String>, type: Class<T>): List<T> {
		return getCollection(collection).getDocuments(keys, type).await().documents.toList()
	}


	/**
	 * Get all documents from the given collection.
	 * @return all documents
	 */
	suspend fun <T> getAllDocuments(collection: String, type: Class<T>): List<T> {
		assertCollections(collection)
		return query("FOR e IN $collection RETURN e", type)
	}


	/**
	 * Replace the document with the given key with the new given document
	 * @return the [DocumentHandle] or [DocumentNotFoundError], if no document with the given key was found
	 */
	suspend fun <T> replaceDocument(collection: String, key: String, value: T): Either<DocumentNotFoundError, DocumentHandle> {
		try {
			return getCollection(collection).replaceDocument(key, value).await().let {
				DocumentHandle(id = it.id, key = it.key, rev = it.rev).right()
			}
		} catch (e: ArangoDBException) {
			return when (e.errorNum) {
				1202 -> DocumentNotFoundError.left()
				else -> throw e
			}
		}
	}


	/**
	 * Replace documents with the new given documents. All documents must have a defined key.
	 * @return the [DocumentHandle] of the successfully replaced documents
	 */
	suspend fun <T> replaceDocuments(collection: String, values: List<T>): List<DocumentHandle> {
		return getCollection(collection).replaceDocuments(values).await().documents
			.map { DocumentHandle(key = it.key, id = it.id, rev = it.rev) }
	}


	/**
	 * Update the document with the given key with the new given  value
	 * @return the [DocumentHandle] or [DocumentNotFoundError] if the document with the given key was not found
	 */
	suspend fun <T> updateDocument(collection: String, key: String, value: T): Either<DocumentNotFoundError, DocumentHandle> {
		try {
			return getCollection(collection).updateDocument(key, value).await().let {
				DocumentHandle(id = it.id, key = it.key, rev = it.rev).right()
			}
		} catch (e: ArangoDBException) {
			return when (e.errorNum) {
				1202 -> DocumentNotFoundError.left()
				else -> throw e
			}
		}
	}


	/**
	 * Update the documents with the new given values
	 * @return the [DocumentHandle] of the successfully updated documents
	 */
	suspend fun <T> updateDocuments(collection: String, values: List<T>): List<DocumentHandle> {
		return getCollection(collection).updateDocuments(values).await().documents
			.map { DocumentHandle(key = it.key, id = it.id, rev = it.rev) }
	}


	/**
	 * Delete the document with the given key
	 * @return the [DocumentHandle] or [DocumentNotFoundError] if the document with the given key was not found
	 */
	suspend fun deleteDocument(collection: String, key: String): Either<DocumentNotFoundError, DocumentHandle> {
		try {
			return getCollection(collection).deleteDocument(key).await().let {
				DocumentHandle(id = it.id, key = it.key, rev = it.rev).right()
			}
		} catch (e: ArangoDBException) {
			return when (e.errorNum) {
				1202 -> DocumentNotFoundError.left()
				else -> throw e
			}
		}
	}


	/**
	 * Delete the documents with the given keys
	 * @return the [DocumentHandle] of the successfully deleted documents
	 */
	suspend fun deleteDocuments(collection: String, keys: Collection<String>): List<DocumentHandle> {
		return getCollection(collection).deleteDocuments(keys).await().documents
			.map { DocumentHandle(key = it.key, id = it.id, rev = it.rev) }
	}


	/**
	 * @return whether the document with the given key collection exists in the given
	 */
	suspend fun existsDocument(collection: String, key: String): Boolean {
		return getCollection(collection).documentExists(key).await()
	}


	/**
	 * @return the amount of documents in the given collection
	 */
	suspend fun count(collection: String): Long {
		return getCollection(collection).count().await().count
	}


	/**
	 * Execute the given query.
	 * @return all results as a list
	 */
	suspend fun <T> query(query: String, type: Class<T>): List<T> {
		return database.query(query, type).await().toList()
	}


	/**
	 * Execute the given query with the given bind-vars.
	 * @return all results as a list
	 */
	suspend fun <T> query(query: String, bindVars: Map<String, Any>, type: Class<T>): List<T> {
		return database.query(query, bindVars, type).await().toList()
	}


	/**
	 * Execute the given query.
	 * @return the result, if exactly one was found, [DocumentNotFoundError] otherwise
	 */
	suspend fun <T> querySingle(query: String, type: Class<T>): Either<DocumentNotFoundError, T> {
		val results = query(query, type)
		return if (results.size == 1) results[0].right() else DocumentNotFoundError.left()
	}


	/**
	 * Execute the given query with the given bind-vars.
	 * @return the result, if exactly one was found, [DocumentNotFoundError] otherwise
	 */
	suspend fun <T> querySingle(query: String, bindVars: Map<String, Any>, type: Class<T>): Either<DocumentNotFoundError, T> {
		val results = query(query, bindVars, type)
		return if (results.size == 1) results[0].right() else DocumentNotFoundError.left()
	}


	/**
	 * Execute the given query.
	 * @return the first result, or [DocumentNotFoundError] if none where found
	 */
	suspend fun <T> queryFirst(query: String, type: Class<T>): Either<DocumentNotFoundError, T> {
		val results = query(query, type)
		return if (results.isNotEmpty()) results[0].right() else DocumentNotFoundError.left()
	}


	/**
	 * Execute the given query with the given bind-vars.
	 * @return the first result, or [DocumentNotFoundError] if none where found
	 */
	suspend fun <T> queryFirst(query: String, bindVars: Map<String, Any>, type: Class<T>): Either<DocumentNotFoundError, T> {
		val results = query(query, bindVars, type)
		return if (results.isNotEmpty()) results[0].right() else DocumentNotFoundError.left()
	}

}
