package io.github.smiley4.strategygame.backend.commondata


class PlayerContainer() : Collection<Player> {

    private val playerList = mutableListOf<Player>()
    private val playerMapByUserId = mutableMapOf<User.Id, Player>()


    constructor(collection: Collection<Player>) : this() {
        this.playerList.addAll(collection)
        collection.forEach { playerMapByUserId[it.user] = it }
    }


    fun add(player: Player) {
        playerList.add(player)
    }


    fun findByUserId(userId: User.Id): Player? {
        return playerMapByUserId[userId]
    }


    fun existsByUserId(userId: User.Id): Boolean {
        return playerMapByUserId.containsKey(userId)
    }


    override val size: Int
        get() = playerList.size

    override fun isEmpty() = playerList.isEmpty()

    override fun iterator() = playerList.iterator()

    override fun containsAll(elements: Collection<Player>) = playerList.containsAll(elements)

    override fun contains(element: Player) = playerList.contains(element)

}