package io.github.smiley4.strategygame.platform.game.domain

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.GameError

internal class Game private constructor(
    private val id: GameId,
    private val name: String,
    private val members: MutableList<GameMember>,
) {

    constructor(name: String, owner: UserId) : this(
        id = GameId(),
        name = name,
        members = mutableListOf(GameMember(owner, PlayerRole.OWNER))
    )

    constructor(snapshot: GameSnapshot) : this(
        id = snapshot.id,
        name = snapshot.name,
        members = snapshot.members.map { GameMember(it.userId, it.role) }.toMutableList()
    )

    fun join(user: UserId) {
        if (members.any { it.user == user }) {
            throw GameError.AlreadyMember(user, id)
        }
        members.add(
            GameMember(
                user = user,
                role = PlayerRole.GUEST
            )
        )
    }

    fun delete(user: UserId) {
        val member = members.first { it.user == user }
        if (member == null || member.role != PlayerRole.OWNER) {
            throw GameError.NotAllowed(user, id, "delete")
        }
    }

    fun isMember(user: UserId): Boolean {
        return members.any { it.user == user }
    }

    fun getId() = id

    fun toSnapshot() = GameSnapshot(
        id = id,
        name = name,
        members = members.map { GameMemberSnapshot(it.user, it.role) }
    )

}