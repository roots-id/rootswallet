class CredentialProof{
    constructor(type, created, purpose, verificationMethod, jws) {
        this.type = type
        this.created = created
        this.purpose = purpose
        this.verificationMethod = verificationMethod
        this.jws = jws
    }
}