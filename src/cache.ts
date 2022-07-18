import { MetadataKey } from "./constants"
import { FactoryTarget, InstanceKey, InstanceMeta, Target, Token, TokenIdentifier, TokenMeta } from "./types"

export class InstanceCache {

    protected storage = new Map<InstanceKey, unknown>()

    // set cache key on the target to enable caching
    public static SetInstanceMeta(target: Target, instanceMeta: InstanceMeta): void {
        Reflect.defineMetadata(MetadataKey.Instance, instanceMeta, target)
    }

    // get cache key on the target to resolve from cache
    public static GetInstanceMeta(target: Target): InstanceMeta | undefined {
        return Reflect.getOwnMetadata(MetadataKey.Instance, target)
    }

    // store the target instance in storage
    public store(key: InstanceKey, instance: unknown): void {
        if (!this.storage.has(key)) {
            this.storage.set(key, instance)
        }
    }

    // retrieve the target instance from storage
    public retrieve<T>(key: InstanceKey): T | undefined {
        return this.storage.get(key) as T | undefined
    }
}

export class TokenCache {

    protected storage = new Map<TokenIdentifier, Target | FactoryTarget>()

    // add new token to target
    public static AddTokenMeta(target: Target, index: number, identifier: TokenIdentifier): void {
        const tokens: TokenMeta = Reflect.getOwnMetadata(MetadataKey.Tokens, target) || {}

        tokens[index] = identifier

        Reflect.defineMetadata(MetadataKey.Tokens, tokens, target)
    }

    // get tokens from target
    public static GetTokenMeta(target: Target): TokenMeta {
        return Reflect.getOwnMetadata(MetadataKey.Tokens, target) || {}
    }

    // store token target in storage
    public store(token: Token): void {
        this.storage.set(token.identifier, token.target)
    }

    // retrieve token target from storage
    public retrieve(identifier: TokenIdentifier): Target | FactoryTarget | undefined {
        return this.storage.get(identifier)
    }
}