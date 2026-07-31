package io.github.smiley4.strategygame.identity.user.domain

import io.github.smiley4.strategygame.identity.shared.HashedPassword
import io.github.smiley4.strategygame.identity.shared.PasswordHasher
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * User aggregate
 */
internal class User private constructor(
    private val id: UserId,
    private var username: Username,
    private var password: HashedPassword
) {

    constructor(username: Username, password: HashedPassword) : this(
        id = UserId(),
        username = username,
        password = password
    )

    constructor(snapshot: UserSnapshot) : this(
        id = snapshot.id,
        username = snapshot.username,
        password = snapshot.password
    )


    /**
     * Check whether the provided password matches the user password
     */
    fun isValidPassword(unsafePassword: UnsafePassword, passwordHasher: PasswordHasher): Boolean {
        val hashedProvidedPassword = passwordHasher.hash(unsafePassword, password.salt)
        return hashedProvidedPassword.hash == password.hash
    }


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
     * @return the username
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