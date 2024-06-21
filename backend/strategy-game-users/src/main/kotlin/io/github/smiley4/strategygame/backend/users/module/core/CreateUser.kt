package io.github.smiley4.strategygame.backend.users.module.core

import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService


class CreateUser(private val userIdentity: UserIdentityService) {

    sealed class CreateUserError : Exception()


    /**
     * The user already exists
     */
    class UserAlreadyExistsError : CreateUserError()


    /**
     * The email or password is not valid
     */
    class InvalidEmailOrPasswordError : CreateUserError()


    /**
     * the confirmation code could not be delivered (e.g. via email)
     */
    class CodeDeliveryError : CreateUserError()


    fun perform(email: String, password: String, username: String) {
        try {
            userIdentity.createUser(email, password, username)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.CodeDeliveryError -> throw UserIdentityService.CodeDeliveryError()
                is UserIdentityService.InvalidEmailOrPasswordError -> throw UserIdentityService.InvalidEmailOrPasswordError()
                is UserIdentityService.UserAlreadyExistsError -> throw UserIdentityService.UserAlreadyExistsError()
                else -> throw Exception("Could not create user", e)
            }
        }
    }

}