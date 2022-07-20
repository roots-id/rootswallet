/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { SubjectMessage } from './transport/SubjectInboundTransport'
import type {
    AutoAcceptProof,
    BasicMessage,
    BasicMessageStateChangedEvent,
    ConnectionRecordProps,
    CredentialDefinitionTemplate,
    CredentialStateChangedEvent,
    InitConfig,
    ProofAttributeInfo,
    ProofPredicateInfo,
    ProofStateChangedEvent,
    SchemaTemplate,
} from '@aries-framework/core'
import type { AcceptOfferOptions } from '@aries-framework/core/build/modules/credentials'
import type { IndyOfferCredentialFormat } from '@aries-framework/core/build/modules/credentials/formats/indy/IndyCredentialFormat'
import type { Schema, CredDef } from 'indy-sdk'
import type { Observable } from 'rxjs'

import path from 'path'
import { firstValueFrom, Subject, ReplaySubject } from 'rxjs'
import { catchError, filter, map, timeout } from 'rxjs/operators'

import { SubjectInboundTransport } from './transport/SubjectInboundTransport'
import { SubjectOutboundTransport } from './transport/SubjectOutboundTransport'
import { agentDependencies, WalletScheme } from '@aries-framework/node'
import {
    PresentationPreview,
    PresentationPreviewAttribute,
    PresentationPreviewPredicate,
    HandshakeProtocol,
    DidExchangeState,
    DidExchangeRole,
    LogLevel,
    AgentConfig,
    AriesFrameworkError,
    BasicMessageEventTypes,
    ConnectionRecord,
    CredentialEventTypes,
    CredentialState,
    PredicateType,
    ProofEventTypes,
    ProofState,
    Agent,
} from '@aries-framework/core'
import { KeyType } from '@aries-framework/core/build/crypto'
import { Attachment, AttachmentData } from '@aries-framework/core/build/decorators/attachment/Attachment'
import { AutoAcceptCredential } from '@aries-framework/core/build/modules/credentials/models/CredentialAutoAcceptType'
import { V1CredentialPreview } from '@aries-framework/core/build/modules/credentials/protocol/v1/messages/V1CredentialPreview'
import { DidCommV1Service, DidKey, Key } from '@aries-framework/core/build/modules/dids'
import { OutOfBandRole } from '@aries-framework/core/build/modules/oob/domain/OutOfBandRole'
import { OutOfBandState } from '@aries-framework/core/build/modules/oob/domain/OutOfBandState'
import { OutOfBandInvitation } from '@aries-framework/core/build/modules/oob/messages'
import { OutOfBandRecord } from '@aries-framework/core/build/modules/oob/repository'
import { LinkedAttachment } from '@aries-framework/core/build/utils/LinkedAttachment'
import { uuid } from '@aries-framework/core/build/utils/uuid'

import testLogger, { TestLogger } from './logger'

export const genesisPath = process.env.GENESIS_TXN_PATH
    ? path.resolve(process.env.GENESIS_TXN_PATH)
    : path.join(__dirname, '../../../network/genesis/local-genesis.txn')

export const publicDidSeed = process.env.TEST_AGENT_PUBLIC_DID_SEED ?? '000000000000000000000000Trustee9'
export { agentDependencies }

export function getBaseConfig(name: string, extraConfig: Partial<InitConfig> = {}) {
    const config: InitConfig = {
        label: `Agent: ${name}`,
        walletConfig: {
            id: `Wallet: ${name}`,
            key: `Key: ${name}`,
        },
        publicDidSeed,
        autoAcceptConnections: true,
        connectToIndyLedgersOnStartup: false,
        indyLedgers: [
            {
                id: `pool-${name}`,
                isProduction: false,
                genesisPath,
                transactionAuthorAgreement: { version: '1', acceptanceMechanism: 'accept' },
            },
        ],
        // TODO: determine the log level based on an environment variable. This will make it
        // possible to run e.g. failed github actions in debug mode for extra logs
        logger: new TestLogger(LogLevel.off, name),
        ...extraConfig,
    }

    return { config, agentDependencies } as const
}

export function getBasePostgresConfig(name: string, extraConfig: Partial<InitConfig> = {}) {
    const config: InitConfig = {
        label: `Agent: ${name}`,
        walletConfig: {
            id: `Wallet${name}`,
            key: `Key${name}`,
            storage: {
                type: 'postgres_storage',
                config: {
                    url: 'localhost:5432',
                    wallet_scheme: WalletScheme.DatabasePerWallet,
                },
                credentials: {
                    account: 'postgres',
                    password: 'postgres',
                    admin_account: 'postgres',
                    admin_password: 'postgres',
                },
            },
        },
        publicDidSeed,
        autoAcceptConnections: true,
        autoUpdateStorageOnStartup: false,
        indyLedgers: [
            {
                id: `pool-${name}`,
                isProduction: false,
                genesisPath,
            },
        ],
        logger: new TestLogger(LogLevel.off, name),
        ...extraConfig,
    }

    return { config, agentDependencies } as const
}

export function getAgentConfig(name: string, extraConfig: Partial<InitConfig> = {}) {
    const { config, agentDependencies } = getBaseConfig(name, extraConfig)
    return new AgentConfig(config, agentDependencies)
}

export async function waitForProofRecord(
    agent: Agent,
    options: {
        threadId?: string
        state?: ProofState
        previousState?: ProofState | null
        timeoutMs?: number
    }
) {
    const observable = agent.events.observable<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged)

    return waitForProofRecordSubject(observable, options)
}

export function waitForProofRecordSubject(
    subject: ReplaySubject<ProofStateChangedEvent> | Observable<ProofStateChangedEvent>,
    {
        threadId,
        state,
        previousState,
        timeoutMs = 10000,
    }: {
        threadId?: string
        state?: ProofState
        previousState?: ProofState | null
        timeoutMs?: number
    }
) {
    const observable = subject instanceof ReplaySubject ? subject.asObservable() : subject
    return firstValueFrom(
        observable.pipe(
            filter((e) => previousState === undefined || e.payload.previousState === previousState),
            filter((e) => threadId === undefined || e.payload.proofRecord.threadId === threadId),
            filter((e) => state === undefined || e.payload.proofRecord.state === state),
            timeout(timeoutMs),
            catchError(() => {
                throw new Error(
                    `ProofStateChangedEvent event not emitted within specified timeout: {
  previousState: ${previousState},
  threadId: ${threadId},
  state: ${state}
}`
                )
            }),
            map((e) => e.payload.proofRecord)
        )
    )
}

export function waitForCredentialRecordSubject(
    subject: ReplaySubject<CredentialStateChangedEvent> | Observable<CredentialStateChangedEvent>,
    {
        threadId,
        state,
        previousState,
        timeoutMs = 10000,
    }: {
        threadId?: string
        state?: CredentialState
        previousState?: CredentialState | null
        timeoutMs?: number
    }
) {
    const observable = subject instanceof ReplaySubject ? subject.asObservable() : subject

    return firstValueFrom(
        observable.pipe(
            filter((e) => previousState === undefined || e.payload.previousState === previousState),
            filter((e) => threadId === undefined || e.payload.credentialRecord.threadId === threadId),
            filter((e) => state === undefined || e.payload.credentialRecord.state === state),
            timeout(timeoutMs),
            catchError(() => {
                throw new Error(`CredentialStateChanged event not emitted within specified timeout: {
  previousState: ${previousState},
  threadId: ${threadId},
  state: ${state}
}`)
            }),
            map((e) => e.payload.credentialRecord)
        )
    )
}

export async function waitForCredentialRecord(
    agent: Agent,
    options: {
        threadId?: string
        state?: CredentialState
        previousState?: CredentialState | null
        timeoutMs?: number
    }
) {
    const observable = agent.events.observable<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged)
    return waitForCredentialRecordSubject(observable, options)
}

export async function waitForBasicMessage(agent: Agent, { content }: { content?: string }): Promise<BasicMessage> {
    return new Promise((resolve) => {
        const listener = (event: BasicMessageStateChangedEvent) => {
            const contentMatches = content === undefined || event.payload.message.content === content

            if (contentMatches) {
                agent.events.off<BasicMessageStateChangedEvent>(BasicMessageEventTypes.BasicMessageStateChanged, listener)

                resolve(event.payload.message)
            }
        }

        agent.events.on<BasicMessageStateChangedEvent>(BasicMessageEventTypes.BasicMessageStateChanged, listener)
    })
}

export function getMockConnection({
                                      state = DidExchangeState.InvitationReceived,
                                      role = DidExchangeRole.Requester,
                                      id = 'test',
                                      did = 'test-did',
                                      threadId = 'threadId',
                                      tags = {},
                                      theirLabel,
                                      theirDid = 'their-did',
                                  }: Partial<ConnectionRecordProps> = {}) {
    return new ConnectionRecord({
        did,
        threadId,
        theirDid,
        id,
        role,
        state,
        tags,
        theirLabel,
    })
}

export function getMockOutOfBand({
                                     label,
                                     serviceEndpoint,
                                     recipientKeys,
                                     mediatorId,
                                     role,
                                     state,
                                     reusable,
                                     reuseConnectionId,
                                     imageUrl,
                                 }: {
    label?: string
    serviceEndpoint?: string
    mediatorId?: string
    recipientKeys?: string[]
    role?: OutOfBandRole
    state?: OutOfBandState
    reusable?: boolean
    reuseConnectionId?: string
    imageUrl?: string
} = {}) {
    const options = {
        label: label ?? 'label',
        imageUrl: imageUrl ?? undefined,
        accept: ['didcomm/aip1', 'didcomm/aip2;env=rfc19'],
        handshakeProtocols: [HandshakeProtocol.DidExchange],
        services: [
            new DidCommV1Service({
                id: `#inline-0`,
                priority: 0,
                serviceEndpoint: serviceEndpoint ?? 'http://example.com',
                recipientKeys: recipientKeys || [
                    new DidKey(Key.fromPublicKeyBase58('ByHnpUCFb1vAfh9CFZ8ZkmUZguURW8nSw889hy6rD8L7', KeyType.Ed25519)).did,
                ],
                routingKeys: [],
            }),
        ],
    }
    const outOfBandInvitation = new OutOfBandInvitation(options)
    const outOfBandRecord = new OutOfBandRecord({
        mediatorId,
        role: role || OutOfBandRole.Receiver,
        state: state || OutOfBandState.Initial,
        outOfBandInvitation: outOfBandInvitation,
        reusable,
        reuseConnectionId,
    })
    return outOfBandRecord
}

export async function makeConnection(agentA: Agent, agentB: Agent) {
    const agentAOutOfBand = await agentA.oob.createInvitation({
        handshakeProtocols: [HandshakeProtocol.Connections],
    })

    let { connectionRecord: agentBConnection } = await agentB.oob.receiveInvitation(agentAOutOfBand.outOfBandInvitation)

    agentBConnection = await agentB.connections.returnWhenIsConnected(agentBConnection!.id)
    let [agentAConnection] = await agentA.connections.findAllByOutOfBandId(agentAOutOfBand.id)
    agentAConnection = await agentA.connections.returnWhenIsConnected(agentAConnection!.id)

    return [agentAConnection, agentBConnection]
}

export async function registerSchema(agent: Agent, schemaTemplate: SchemaTemplate): Promise<Schema> {
    const schema = await agent.ledger.registerSchema(schemaTemplate)
    testLogger.test(`created schema with id ${schema.id}`, schema)
    return schema
}

export async function registerDefinition(
    agent: Agent,
    definitionTemplate: CredentialDefinitionTemplate
): Promise<CredDef> {
    const credentialDefinition = await agent.ledger.registerCredentialDefinition(definitionTemplate)
    testLogger.test(`created credential definition with id ${credentialDefinition.id}`, credentialDefinition)
    return credentialDefinition
}

export async function prepareForIssuance(agent: Agent, attributes: string[]) {
    const publicDid = agent.publicDid?.did

    if (!publicDid) {
        throw new AriesFrameworkError('No public did')
    }

    await ensurePublicDidIsOnLedger(agent, publicDid)

    const schema = await registerSchema(agent, {
        attributes,
        name: `schema-${uuid()}`,
        version: '1.0',
    })

    const definition = await registerDefinition(agent, {
        schema,
        signatureType: 'CL',
        supportRevocation: false,
        tag: 'default',
    })

    return {
        schema,
        definition,
        publicDid,
    }
}

export async function ensurePublicDidIsOnLedger(agent: Agent, publicDid: string) {
    try {
        testLogger.test(`Ensure test DID ${publicDid} is written to ledger`)
        await agent.ledger.getPublicDid(publicDid)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        // Unfortunately, this won't prevent from the test suite running because of Jest runner runs all tests
        // regardless of thrown errors. We're more explicit about the problem with this error handling.
        throw new Error(`Test DID ${publicDid} is not written on ledger or ledger is not available: ${error.message}`)
    }
}

/**
 * Assumes that the autoAcceptCredential is set to {@link AutoAcceptCredential.ContentApproved}
 */
export async function issueCredential({
                                          issuerAgent,
                                          issuerConnectionId,
                                          holderAgent,
                                          credentialTemplate,
                                      }: {
    issuerAgent: Agent
    issuerConnectionId: string
    holderAgent: Agent
    credentialTemplate: IndyOfferCredentialFormat
}) {
    const issuerReplay = new ReplaySubject<CredentialStateChangedEvent>()
    const holderReplay = new ReplaySubject<CredentialStateChangedEvent>()

    issuerAgent.events
        .observable<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged)
        .subscribe(issuerReplay)
    holderAgent.events
        .observable<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged)
        .subscribe(holderReplay)

    let issuerCredentialRecord = await issuerAgent.credentials.offerCredential({
        comment: 'some comment about credential',
        connectionId: issuerConnectionId,
        protocolVersion: 'v1',
        credentialFormats: {
            indy: {
                attributes: credentialTemplate.attributes,
                credentialDefinitionId: credentialTemplate.credentialDefinitionId,
                linkedAttachments: credentialTemplate.linkedAttachments,
            },
        },
        autoAcceptCredential: AutoAcceptCredential.ContentApproved,
    })

    let holderCredentialRecord = await waitForCredentialRecordSubject(holderReplay, {
        threadId: issuerCredentialRecord.threadId,
        state: CredentialState.OfferReceived,
    })

    const acceptOfferOptions: AcceptOfferOptions = {
        credentialRecordId: holderCredentialRecord.id,
        autoAcceptCredential: AutoAcceptCredential.ContentApproved,
    }

    await holderAgent.credentials.acceptOffer(acceptOfferOptions)

    // Because we use auto-accept it can take a while to have the whole credential flow finished
    // Both parties need to interact with the ledger and sign/verify the credential
    holderCredentialRecord = await waitForCredentialRecordSubject(holderReplay, {
        threadId: issuerCredentialRecord.threadId,
        state: CredentialState.Done,
    })
    issuerCredentialRecord = await waitForCredentialRecordSubject(issuerReplay, {
        threadId: issuerCredentialRecord.threadId,
        state: CredentialState.Done,
    })

    return {
        issuerCredential: issuerCredentialRecord,
        holderCredential: holderCredentialRecord,
    }
}

export async function issueConnectionLessCredential({
                                                        issuerAgent,
                                                        holderAgent,
                                                        credentialTemplate,
                                                    }: {
    issuerAgent: Agent
    holderAgent: Agent
    credentialTemplate: IndyOfferCredentialFormat
}) {
    const issuerReplay = new ReplaySubject<CredentialStateChangedEvent>()
    const holderReplay = new ReplaySubject<CredentialStateChangedEvent>()

    issuerAgent.events
        .observable<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged)
        .subscribe(issuerReplay)
    holderAgent.events
        .observable<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged)
        .subscribe(holderReplay)

    // eslint-disable-next-line prefer-const
    let { credentialRecord: issuerCredentialRecord, message } = await issuerAgent.credentials.createOffer({
        comment: 'V1 Out of Band offer',
        protocolVersion: 'v1',
        credentialFormats: {
            indy: {
                attributes: credentialTemplate.attributes,
                credentialDefinitionId: credentialTemplate.credentialDefinitionId,
            },
        },
        autoAcceptCredential: AutoAcceptCredential.ContentApproved,
    })

    const { message: offerMessage } = await issuerAgent.oob.createLegacyConnectionlessInvitation({
        recordId: issuerCredentialRecord.id,
        domain: 'https://example.org',
        message,
    })

    await holderAgent.receiveMessage(offerMessage.toJSON())

    let holderCredentialRecord = await waitForCredentialRecordSubject(holderReplay, {
        threadId: issuerCredentialRecord.threadId,
        state: CredentialState.OfferReceived,
    })
    const acceptOfferOptions: AcceptOfferOptions = {
        credentialRecordId: holderCredentialRecord.id,
        autoAcceptCredential: AutoAcceptCredential.ContentApproved,
    }

    await holderAgent.credentials.acceptOffer(acceptOfferOptions)

    holderCredentialRecord = await waitForCredentialRecordSubject(holderReplay, {
        threadId: issuerCredentialRecord.threadId,
        state: CredentialState.Done,
    })

    issuerCredentialRecord = await waitForCredentialRecordSubject(issuerReplay, {
        threadId: issuerCredentialRecord.threadId,
        state: CredentialState.Done,
    })

    return {
        issuerCredential: issuerCredentialRecord,
        holderCredential: holderCredentialRecord,
    }
}

export async function presentProof({
                                       verifierAgent,
                                       verifierConnectionId,
                                       holderAgent,
                                       presentationTemplate: { attributes, predicates },
                                   }: {
    verifierAgent: Agent
    verifierConnectionId: string
    holderAgent: Agent
    presentationTemplate: {
        attributes?: Record<string, ProofAttributeInfo>
        predicates?: Record<string, ProofPredicateInfo>
    }
}) {
    const verifierReplay = new ReplaySubject<ProofStateChangedEvent>()
    const holderReplay = new ReplaySubject<ProofStateChangedEvent>()

    verifierAgent.events.observable<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged).subscribe(verifierReplay)
    holderAgent.events.observable<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged).subscribe(holderReplay)

    let verifierRecord = await verifierAgent.proofs.requestProof(verifierConnectionId, {
        name: 'test-proof-request',
        requestedAttributes: attributes,
        requestedPredicates: predicates,
    })

    let holderRecord = await waitForProofRecordSubject(holderReplay, {
        threadId: verifierRecord.threadId,
        state: ProofState.RequestReceived,
    })

    const retrievedCredentials = await holderAgent.proofs.getRequestedCredentialsForProofRequest(holderRecord.id)
    const requestedCredentials = holderAgent.proofs.autoSelectCredentialsForProofRequest(retrievedCredentials)
    await holderAgent.proofs.acceptRequest(holderRecord.id, requestedCredentials)

    verifierRecord = await waitForProofRecordSubject(verifierReplay, {
        threadId: holderRecord.threadId,
        state: ProofState.PresentationReceived,
    })

    // assert presentation is valid
    expect(verifierRecord.isVerified).toBe(true)

    verifierRecord = await verifierAgent.proofs.acceptPresentation(verifierRecord.id)
    holderRecord = await waitForProofRecordSubject(holderReplay, {
        threadId: holderRecord.threadId,
        state: ProofState.Done,
    })

    return {
        verifierProof: verifierRecord,
        holderProof: holderRecord,
    }
}

/**
 * Returns mock of function with correct type annotations according to original function `fn`.
 * It can be used also for class methods.
 *
 * @param fn function you want to mock
 * @returns mock function with type annotations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
    return fn as jest.MockedFunction<T>
}

/**
 * Set a property using a getter value on a mocked oject.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function mockProperty<T extends {}, K extends keyof T>(object: T, property: K, value: T[K]) {
    Object.defineProperty(object, property, { get: () => value })
}

export async function setupCredentialTests(
    faberName: string,
    aliceName: string,
    autoAcceptCredentials?: AutoAcceptCredential
) {
    const faberMessages = new Subject<SubjectMessage>()
    const aliceMessages = new Subject<SubjectMessage>()
    const subjectMap = {
        'rxjs:faber': faberMessages,
        'rxjs:alice': aliceMessages,
    }
    const faberConfig = getBaseConfig(faberName, {
        endpoints: ['rxjs:faber'],
        autoAcceptCredentials,
    })

    const aliceConfig = getBaseConfig(aliceName, {
        endpoints: ['rxjs:alice'],
        autoAcceptCredentials,
    })
    const faberAgent = new Agent(faberConfig.config, faberConfig.agentDependencies)
    faberAgent.registerInboundTransport(new SubjectInboundTransport(faberMessages))
    faberAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))
    await faberAgent.initialize()

    const aliceAgent = new Agent(aliceConfig.config, aliceConfig.agentDependencies)
    aliceAgent.registerInboundTransport(new SubjectInboundTransport(aliceMessages))
    aliceAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))
    await aliceAgent.initialize()

    const {
        schema,
        definition: { id: credDefId },
    } = await prepareForIssuance(faberAgent, ['name', 'age', 'profile_picture', 'x-ray'])

    const [faberConnection, aliceConnection] = await makeConnection(faberAgent, aliceAgent)

    return { faberAgent, aliceAgent, credDefId, schema, faberConnection, aliceConnection }
}

export async function setupProofsTest(faberName: string, aliceName: string, autoAcceptProofs?: AutoAcceptProof) {
    const credentialPreview = V1CredentialPreview.fromRecord({
        name: 'John',
        age: '99',
    })

    const unique = uuid().substring(0, 4)

    const faberConfig = getBaseConfig(`${faberName}-${unique}`, {
        autoAcceptProofs,
        endpoints: ['rxjs:faber'],
    })

    const aliceConfig = getBaseConfig(`${aliceName}-${unique}`, {
        autoAcceptProofs,
        endpoints: ['rxjs:alice'],
    })

    const faberMessages = new Subject<SubjectMessage>()
    const aliceMessages = new Subject<SubjectMessage>()

    const subjectMap = {
        'rxjs:faber': faberMessages,
        'rxjs:alice': aliceMessages,
    }
    const faberAgent = new Agent(faberConfig.config, faberConfig.agentDependencies)
    faberAgent.registerInboundTransport(new SubjectInboundTransport(faberMessages))
    faberAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))
    await faberAgent.initialize()

    const aliceAgent = new Agent(aliceConfig.config, aliceConfig.agentDependencies)
    aliceAgent.registerInboundTransport(new SubjectInboundTransport(aliceMessages))
    aliceAgent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap))
    await aliceAgent.initialize()

    const { definition } = await prepareForIssuance(faberAgent, ['name', 'age', 'image_0', 'image_1'])

    const [agentAConnection, agentBConnection] = await makeConnection(faberAgent, aliceAgent)
    expect(agentAConnection.isReady).toBe(true)
    expect(agentBConnection.isReady).toBe(true)

    const faberConnection = agentAConnection
    const aliceConnection = agentBConnection

    const presentationPreview = new PresentationPreview({
        attributes: [
            new PresentationPreviewAttribute({
                name: 'name',
                credentialDefinitionId: definition.id,
                referent: '0',
                value: 'John',
            }),
            new PresentationPreviewAttribute({
                name: 'image_0',
                credentialDefinitionId: definition.id,
            }),
        ],
        predicates: [
            new PresentationPreviewPredicate({
                name: 'age',
                credentialDefinitionId: definition.id,
                predicate: PredicateType.GreaterThanOrEqualTo,
                threshold: 50,
            }),
        ],
    })

    await issueCredential({
        issuerAgent: faberAgent,
        issuerConnectionId: faberConnection.id,
        holderAgent: aliceAgent,
        credentialTemplate: {
            credentialDefinitionId: definition.id,
            attributes: credentialPreview.attributes,
            linkedAttachments: [
                new LinkedAttachment({
                    name: 'image_0',
                    attachment: new Attachment({
                        filename: 'picture-of-a-cat.png',
                        data: new AttachmentData({ base64: 'cGljdHVyZSBvZiBhIGNhdA==' }),
                    }),
                }),
                new LinkedAttachment({
                    name: 'image_1',
                    attachment: new Attachment({
                        filename: 'picture-of-a-dog.png',
                        data: new AttachmentData({ base64: 'UGljdHVyZSBvZiBhIGRvZw==' }),
                    }),
                }),
            ],
        },
    })
    const faberReplay = new ReplaySubject<ProofStateChangedEvent>()
    const aliceReplay = new ReplaySubject<ProofStateChangedEvent>()

    faberAgent.events.observable<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged).subscribe(faberReplay)
    aliceAgent.events.observable<ProofStateChangedEvent>(ProofEventTypes.ProofStateChanged).subscribe(aliceReplay)

    return {
        faberAgent,
        aliceAgent,
        credDefId: definition.id,
        faberConnection,
        aliceConnection,
        presentationPreview,
        faberReplay,
        aliceReplay,
    }
}
