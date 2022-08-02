package de.ruegnerlukas.strategygame.backend.shared.arango

import com.arangodb.DbName
import com.arangodb.async.ArangoCollectionAsync
import com.arangodb.async.ArangoCursorAsync
import com.arangodb.async.ArangoDBAsync
import com.arangodb.async.ArangoDatabaseAsync
import com.arangodb.entity.CollectionPropertiesEntity
import com.arangodb.entity.DocumentCreateEntity
import com.arangodb.entity.DocumentDeleteEntity
import com.arangodb.entity.DocumentUpdateEntity
import com.arangodb.entity.MultiDocumentEntity
import com.arangodb.mapping.ArangoJack
import com.arangodb.model.DocumentDeleteOptions
import com.fasterxml.jackson.module.kotlin.KotlinModule
import kotlinx.coroutines.future.await

class ArangoDatabase(private val database: ArangoDatabaseAsync) {

	companion object {
		suspend fun create(host: String, port: Int, username: String?, password: String?, name: String): ArangoDatabase {
			val arango = ArangoDBAsync.Builder()
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
			val database = arango.db(DbName.of(name))
			if (!database.exists().await()) {
				database.create()
			}
			return ArangoDatabase(database)
		}

	}


	private val collections = mutableMapOf<String, ArangoCollectionAsync>()


	/**
	 * Return the collection with the given name. If the collection does not yet exist, create it.
	 */
	private suspend fun getCollection(name: String): ArangoCollectionAsync {
		var collection = collections[name]
		if (collection == null) {
			collection = database.collection(name)
			if (!collection.exists().await()) {
				collection.create()
			}
			collections[name] = collection
			return collection
		} else {
			return collection
		}
	}


	/**
	 * Creates a new document from the given document, unless there is already a document with the _key given. If no
	 * _key is given, a new unique _key is generated automatically.
	 *
	 * @param value A representation of a single document (POJO, VPackSlice or String for Json)
	 * @return information about the document
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#create-document">API
	 * Documentation</a>
	 */
	suspend fun <T> insertDocument(collection: String, value: T): DocumentCreateEntity<T> {
		return getCollection(collection).insertDocument(value).await()
	}


	/**
	 * Creates new documents from the given documents, unless there is already a document with the _key given. If no
	 * _key is given, a new unique _key is generated automatically.
	 *
	 * @param values A List of documents (POJO, VPackSlice or String for Json)
	 * @return information about the documents
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#create-document">API
	 * Documentation</a>
	 */
	suspend fun <T> insertDocuments(collection: String, values: List<T>): MultiDocumentEntity<DocumentCreateEntity<T>> {
		return getCollection(collection).insertDocuments(values).await()
	}


	/**
	 * Reads a single document
	 *
	 * @param key  The key of the document
	 * @param type The type of the document (POJO class, VPackSlice or String for Json)
	 * @return the document identified by the key
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#read-document">API
	 * Documentation</a>
	 */
	suspend fun <T> getDocument(collection: String, key: String, type: Class<T>): T {
		return getCollection(collection).getDocument(key, type).await()
	}


	/**
	 * Reads multiple documents
	 *
	 * @param keys The keys of the documents
	 * @param type The type of the documents (POJO class, VPackSlice or String for Json)
	 * @return the documents and possible errors
	 */
	suspend fun <T> getDocuments(collection: String, keys: List<String>, type: Class<T>): MultiDocumentEntity<T> {
		return getCollection(collection).getDocuments(keys, type).await()
	}


	/**
	 * Replaces the document with key with the one in the body, provided there is such a document and no precondition is
	 * violated
	 *
	 * @param key   The key of the document
	 * @param value A representation of a single document (POJO, VPackSlice or String for Json)
	 * @return information about the document
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#replace-document">API
	 * Documentation</a>
	 */
	suspend fun <T> replaceDocument(collection: String, key: String, value: T): DocumentUpdateEntity<T> {
		return getCollection(collection).replaceDocument(key, value).await()
	}


	/**
	 * Replaces multiple documents in the specified collection with the ones in the values, the replaced documents are
	 * specified by the _key attributes in the documents in values.
	 *
	 * @param values A List of documents (POJO, VPackSlice or String for Json)
	 * @return information about the documents
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#replace-documents">API
	 * Documentation</a>
	 */
	suspend fun <T> replaceDocuments(collection: String, values: List<T>): MultiDocumentEntity<DocumentUpdateEntity<T>> {
		return getCollection(collection).replaceDocuments(values).await()
	}


	/**
	 * Partially updates the document identified by document-key. The value must contain a document with the attributes
	 * to patch (the patch document). All attributes from the patch document will be added to the existing document if
	 * they do not yet exist, and overwritten in the existing document if they do exist there.
	 *
	 * @param key   The key of the document
	 * @param value A representation of a single document (POJO, VPackSlice or String for Json)
	 * @return information about the document
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#update-document">API
	 * Documentation</a>
	 */
	suspend fun <T> updateDocument(collection: String, key: String, value: T): DocumentUpdateEntity<T> {
		return getCollection(collection).updateDocument(key, value).await()
	}


	/**
	 * Partially updates documents, the documents to update are specified by the _key attributes in the objects on
	 * values. Vales must contain a list of document updates with the attributes to patch (the patch documents). All
	 * attributes from the patch documents will be added to the existing documents if they do not yet exist, and
	 * overwritten in the existing documents if they do exist there.
	 *
	 * @param values A list of documents (POJO, VPackSlice or String for Json)
	 * @return information about the documents
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#update-documents">API
	 * Documentation</a>
	 */
	suspend fun <T> updateDocuments(collection: String, values: List<T>): MultiDocumentEntity<DocumentUpdateEntity<T>> {
		return getCollection(collection).updateDocuments(values).await()
	}


	/**
	 * Removes a document
	 *
	 * @param key The key of the document
	 * @return information about the document
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#removes-a-document">API
	 * Documentation</a>
	 */
	suspend fun deleteDocument(collection: String, key: String): DocumentDeleteEntity<Void> {
		return getCollection(collection).deleteDocument(key).await()
	}


	/**
	 * Removes a document
	 *
	 * @param key     The key of the document
	 * @param type    The type of the document (POJO class, VPackSlice or String for Json). Only necessary if
	 *                options.returnOld is set to true, otherwise can be null.
	 * @return information about the document
	 * @see <a href="https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#removes-a-document">API
	 * Documentation</a>
	 */
	suspend fun <T> deleteDocument(collection: String, key: String, type: Class<T>): DocumentDeleteEntity<T> {
		return getCollection(collection).deleteDocument(key, type, DocumentDeleteOptions()).await()
	}


	/**
	 * Removes multiple document
	 *
	 * @param values The keys of the documents or the documents themselves
	 * @return information about the documents
	 * @see <a href=
	 * "https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#removes-multiple-documents">API
	 * Documentation</a>
	 */
	suspend fun <T> deleteDocuments(collection: String, values: List<T>): MultiDocumentEntity<DocumentDeleteEntity<Void>> {
		return getCollection(collection).deleteDocuments(values).await()
	}


	/**
	 * Removes multiple document
	 *
	 * @param keys    The keys of the documents
	 * @param type    The type of the documents (POJO class, VPackSlice or String for Json). Only necessary if
	 *                options.returnOld is set to true, otherwise can be null.
	 * @return information about the documents
	 * @see <a href=
	 * "https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#removes-multiple-documents">API
	 * Documentation</a>
	 */
	suspend fun <T> deleteDocuments(collection: String, keys: List<String>, type: Class<T>): MultiDocumentEntity<DocumentDeleteEntity<T>> {
		return getCollection(collection).deleteDocuments(keys, type, DocumentDeleteOptions()).await()
	}


	/**
	 * Checks if the document exists by reading a single document head
	 *
	 * @param key The key of the document
	 * @return true if the document was found, otherwise false
	 * @see <a href=
	 * "https://www.arangodb.com/docs/stable/http/document-working-with-documents.html#read-document-header">API
	 * Documentation</a>
	 */
	suspend fun existsDocument(collection: String, key: String): Boolean {
		return getCollection(collection).documentExists(key).await()
	}


	/**
	 * Counts the documents in a collection
	 *
	 * @return information about the collection, including the number of documents
	 * @see <a href=
	 * "https://www.arangodb.com/docs/stable/http/collection-getting.html#return-number-of-documents-in-a-collection">API
	 * Documentation</a>
	 */
	suspend fun count(collection: String): CollectionPropertiesEntity {
		return getCollection(collection).count().await()
	}


	/**
	 * Performs a database query using the given {@code query}, then returns a new {@code ArangoCursor} instance for the
	 * result list.
	 *
	 * @param query contains the query string to be executed
	 * @param type  The type of the result (POJO class, VPackSlice, String for Json, or Collection/List/Map)
	 * @return cursor of the results
	 * @see <a href="https://www.arangodb.com/docs/stable/http/aql-query-cursor-accessing-cursors.html#create-cursor">API
	 * Documentation</a>
	 */
	suspend fun <T> query(query: String, type: Class<T>): ArangoCursorAsync<T>? {
		return database.query(query, type).await()
	}


	/**
	 * Performs a database query using the given {@code query} and {@code bindVars}, then returns a new
	 * {@code ArangoCursor} instance for the result list.
	 *
	 * @param query    contains the query string to be executed
	 * @param bindVars key/value pairs representing the bind parameters
	 * @param type     The type of the result (POJO class, VPackSlice, String for Json, or Collection/List/Map)
	 * @return cursor of the results
	 * @see <a href="https://www.arangodb.com/docs/stable/http/aql-query-cursor-accessing-cursors.html#create-cursor">API
	 * Documentation</a>
	 */
	suspend fun <T> query(query: String, bindVars: Map<String, Any>, type: Class<T>): ArangoCursorAsync<T>? {
		return database.query(query, bindVars, type).await()
	}

}
