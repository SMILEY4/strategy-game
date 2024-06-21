package io.github.smiley4.strategygame.backend.common.data


class PlayerContainer() : Collection<Player> {

    private val playerList = mutableListOf<Player>()
    private val playerMapByUserId = mutableMapOf<String, Player>()


    constructor(collection: Collection<Player>) : this() {
        this.playerList.addAll(collection)
        collection.forEach { playerMapByUserId[it.userId] = it }
    }


    fun add(player: Player) {
        playerList.add(player)
    }


    fun findByUserId(userId: String): Player? {
        return playerMapByUserId[userId]
    }


    fun existsByUserId(userId: String): Boolean {
        return playerMapByUserId.containsKey(userId)
    }


    override val size: Int
        get() = playerList.size

    override fun isEmpty() = playerList.isEmpty()

    override fun iterator() = playerList.iterator()

    override fun containsAll(elements: Collection<Player>) = playerList.containsAll(elements)

    override fun contains(element: Player) = playerList.contains(element)

}