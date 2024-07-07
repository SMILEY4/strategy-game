package io.github.smiley4.strategygame.backend.common.utils

import java.io.ByteArrayOutputStream
import java.util.zip.GZIPOutputStream
import kotlin.text.Charsets.UTF_8

object GZip {

    fun compress(content: String): ByteArray {
        val bos = ByteArrayOutputStream()
        GZIPOutputStream(bos).bufferedWriter(UTF_8).use { it.write(content) }
        return bos.toByteArray()
    }

    fun compressToBase64(content: String): String {
        return Base64.toBase64(compress(content))
    }

}