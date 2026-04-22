package io.github.smiley4.strategygame.identity.user.domain

/**
 * User aggregate
 */
internal class User(
    private val id: UserId,
    private var username: Username,
    private var password: HashedPassword
) {

    constructor(snapshot: UserSnapshot) : this(
        id = snapshot.id,
        username = snapshot.username,
        password = snapshot.password
    )

    /**
     * Change the username to the given new username
     */
    fun changeUsername(newUsername: Username) {
        this.username = newUsername
    }


    /**
     * Change the password to the given new password
     */
    fun changePassword(newPassword: HashedPassword) {
        this.password = newPassword
    }

    /**
     * @return the user id
     */
    fun getId() = this.id

    /**
     * @return the user name
     */
    fun getUsername() = this.username


    /**
     * @return a [UserSnapshot] from this user
     */
    fun toSnapshot() = UserSnapshot(
        id = id,
        username = username,
        password = password
    )

}