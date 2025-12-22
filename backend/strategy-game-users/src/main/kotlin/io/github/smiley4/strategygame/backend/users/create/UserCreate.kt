package io.github.smiley4.strategygame.backend.users.create

import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService


internal class UserCreate(
    private val userIdentity: UserIdentityService
) {

    /**
     * Create a new user with the given email, password and username.
     * @throws UserCreateError
     */
    fun create(email: String, password: String, username: String) {
        try {
            userIdentity.createUser(email, password, username)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.CodeDeliveryError -> throw UserCreateError.CodeDeliveryError(e)
                is UserIdentityService.InvalidEmailOrPasswordError -> throw UserCreateError.InvalidEmailOrPasswordError(e)
                is UserIdentityService.UserAlreadyExistsError -> throw UserCreateError.UserAlreadyExistsError(e)
                else -> throw Exception("Could not create user", e)
            }
        }
    }

}