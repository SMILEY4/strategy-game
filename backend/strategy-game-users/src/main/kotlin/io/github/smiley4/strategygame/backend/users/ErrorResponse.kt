package io.github.smiley4.strategygame.backend.users

open class ErrorResponse( // todo: temporary
    /**
     * an url to a document describing the error
     */
    val type: String = "about:blank",
    /**
     * the http status code
     */
    val status: Int,
    /**
     * A short, human-readable title for the general error type
     */
    val title: String,
    /**
     * a machine-readable (enum-like) code for the general error type
     */
    val errorCode: String,
    /**
     * a human-readable description of the specific error
     */
    val detail: String,
    /**
     * additional machine-readable key-value pairs relevant for the specific error
     */
    val context: Map<String, Any?>? = null
)