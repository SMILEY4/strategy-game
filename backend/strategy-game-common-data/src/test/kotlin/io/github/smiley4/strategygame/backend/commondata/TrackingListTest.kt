package io.github.smiley4.strategygame.backend.commondata

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe

class TrackingListTest : StringSpec({

    "add elements" {
        trackingListOf<String>()
            .apply {
                this.add("a")
                this.addAll(listOf("b", "c"))
                this.add(0, "d")
                this.addAll(0, listOf("e", "f"))
            }
            .also {
                it.size shouldBe 6
                it.getAddedElements() shouldContainExactlyInAnyOrder listOf("a", "b", "c", "d", "e", "f")
                it.getRemovedElements() shouldContainExactlyInAnyOrder emptyList()
                it shouldContainExactly listOf("e", "f", "d", "a", "b", "c")
                it.toList() shouldContainExactly listOf("e", "f", "d", "a", "b", "c")
            }
    }

    "remove elements" {
        trackingListOf("a", "b", "c", "d", "e", "f", "g", "h", "i")
            .apply {
                this.remove("a")
                this.removeAll(listOf("b", "c", "x"))
                this.removeAt(0)
                this.removeIf { it == "e" }
                this.removeAll { it == "f" }
                this.removeFirst()
                this.removeLast()
                this.remove("y")
            }
            .also {
                it.size shouldBe 1
                it.getAddedElements() shouldContainExactlyInAnyOrder emptyList()
                it.getRemovedElements() shouldContainExactlyInAnyOrder listOf("a", "b", "c", "d", "e", "f", "g", "i")
                it shouldContainExactly listOf("h")
                it.toList() shouldContainExactly listOf("h")
            }
    }

    "clear" {
        trackingListOf("a", "b", "c")
            .apply {
                this.add("d")
                this.remove("a")
                this.clear()
            }
            .also {
                it.size shouldBe 0
                it.getAddedElements() shouldContainExactlyInAnyOrder emptyList()
                it.getRemovedElements() shouldContainExactlyInAnyOrder listOf("a", "b", "c", "d")
                it shouldContainExactly emptyList()
                it.toList() shouldContainExactly emptyList()
            }
    }

    "set elements" {
        trackingListOf("a", "b", "c")
            .apply {
                this[1] = "d"
                this.set(2, "e")
            }
            .also {
                it.size shouldBe 3
                it.getAddedElements() shouldContainExactlyInAnyOrder listOf("d", "e")
                it.getRemovedElements() shouldContainExactlyInAnyOrder listOf("b", "c")
                it shouldContainExactly listOf("a", "d", "e")
                it.toList() shouldContainExactly listOf("a", "d", "e")
            }
    }

    "add and remove elements" {
        trackingListOf("a", "b", "c")
            .apply {
                this.remove("a")
                this.add("e")
                this.removeAt(2) // e
                this.addAll(listOf("a", "f"))
                this.removeIf { it == "a" }
                this[2] = "g"
            }
            .also {
                it.size shouldBe 3
                it.getAddedElements() shouldContainExactlyInAnyOrder listOf("g")
                it.getRemovedElements() shouldContainExactlyInAnyOrder listOf("a", "e", "f")
                it shouldContainExactly listOf("b", "c", "g")
                it.toList() shouldContainExactly listOf("b", "c", "g")
            }
    }

    "foreach-loop" {
        val actual = mutableListOf<String>()
        val tracking = trackingListOf("a", "b", "c").apply {
            this.removeAt(1) // b
            this.add("d")
        }
        for (element in tracking) {
            actual.add(element)
        }
        actual shouldContainExactly listOf("a", "c", "d")
    }

    "get sublist" {
        trackingListOf("a", "b", "c")
            .apply {
                this.removeAll(listOf("a", "c"))
                this.addAll(listOf("d", "e", "f"))
                // -> b, d, e, f
            }
            .also {
                it.subList(1, 3) shouldContainExactly listOf("d", "e")
            }
    }

    "get" {
        trackingListOf("a", "b", "c")
            .apply {
                this.removeAll(listOf("a", "c"))
                this.addAll(listOf("d", "e", "f"))
                // -> b, d, e, f
            }
            .also {
                it[0] shouldBe "b"
                it[2] shouldBe "e"
                it.indexOf("d") shouldBe 1
                it.indexOf("a") shouldBe -1
                it.contains("f") shouldBe true
                it.contains("c") shouldBe false
                it.containsAll(listOf("e", "f")) shouldBe true
                it.containsAll(listOf("e", "a")) shouldBe false
                it.containsAll(listOf("a", "c")) shouldBe false
            }
    }

})
