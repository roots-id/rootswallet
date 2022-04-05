package com.rootswallet
import org.didcommx.didcomm.secret.SecretResolverEditable
import org.didcommx.didcomm.secret.Secret
import java.util.Optional

class SecretResolverInMemoryMock() : SecretResolverEditable {
    private val secrets: MutableMap<String, Secret>
    init {
        secrets = mutableMapOf()
    }

    override fun addKey(secret: Secret) {
        secrets.put(secret.kid, secret)
    }
    override fun getKids(): List<String> =
        secrets.keys.toList()
    override fun findKey(kid: String): Optional<Secret> =
        Optional.ofNullable(secrets[kid])

    override fun findKeys(kids: List<String>): Set<String> =
        kids.intersect(this.secrets.keys)
}