package de.ruegnerlukas.strategygame.backend.external.parameters

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagement
import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagementClientBuilder
import com.amazonaws.services.simplesystemsmanagement.model.GetParameterRequest
import de.ruegnerlukas.strategygame.backend.ports.required.ParameterService
import de.ruegnerlukas.strategygame.backend.shared.Logging


class AWSParameterStore(private val client: AWSSimpleSystemsManagement) : ParameterService, Logging {

    companion object {

        fun create(accessKey: String, secretKey: String, region: String): AWSParameterStore {
            val client: AWSSimpleSystemsManagement = AWSSimpleSystemsManagementClientBuilder
                .standard()
                .withRegion(region)
                .withCredentials(AWSStaticCredentialsProvider(BasicAWSCredentials(accessKey, secretKey)))
                .build()
            return AWSParameterStore(client)
        }

    }

    private fun getParameter(parameterName: String): String? {
        log().info("Fetching Parameter with name '$parameterName'.")
        return try {
            client.getParameter(
                GetParameterRequest()
                    .withName(parameterName)
                    .withWithDecryption(true)
            ).parameter.value
        } catch (e: Exception) {
            null
        }
    }

}