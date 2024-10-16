package io.github.smiley4.strategygame.backend.commondata

object DbId {

    const val PLACEHOLDER = "_placeholder"

    fun asDbId(value: String?): String? {
        return value?.let {
            if (it == PLACEHOLDER) {
                return null
            } else {
                it
            }
        }
    }

}
