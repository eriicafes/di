import "reflect-metadata"
import { InstanceCache, TokenCache } from "./cache"
import { Scope } from "./constants"
import { Dependencies, FactoryTarget, InstanceMeta, RegisterToken, Target, TokenIdentifier } from "./types"
import { arrayIncludes } from "./utils"

/**
 * DI Container class
 */
export class DIContainer {

    private readonly instanceCache = new InstanceCache()
    private readonly tokenCache = new TokenCache()

    constructor(
        private name: string = DIContainer.name,
        private parent?: DIContainer,
        private root?: DIContainer
    ) { }

    private storeInstance<T>(instanceMeta: InstanceMeta | undefined, instance: T) {
        if (instanceMeta) {
            // if scope is local singleton, store in the current container
            if (instanceMeta.scope === Scope.LocalSingleton) {
                this.instanceCache.store(instanceMeta.key, instance)
            }
            // if scope is a global singleton, store in root container
            if (instanceMeta.scope === Scope.Singleton) {
                // this.root is undefined only in the root container
                (this.root || this).instanceCache.store(instanceMeta.key, instance)
            }
        }
    }

    private retrieveInstance<T>(instanceMeta: InstanceMeta | undefined): T | undefined {
        if (instanceMeta) {
            // if scope is local singleton, retrieve from the current container
            if (instanceMeta.scope === Scope.LocalSingleton) {
                return this.instanceCache.retrieve<T>(instanceMeta.key)
            }
            // if scope is a global singleton, retrieve from root container
            if (instanceMeta.scope === Scope.Singleton) {
                // this.root is undefined only in the root container
                return (this.root || this).instanceCache.retrieve<T>(instanceMeta.key)
            }
        }
    }

    /**
     * Register token in container instance
     * @param token A token registration object
     */
    public registerToken(token: RegisterToken) {
        // handle class token
        if (token.target) return this.tokenCache.store({
            identifier: token.identifier,
            target: token.target
        })

        // handle factory token
        // check if factory function arguments length is not more than 1
        if (token.factory.length <= 1) {
            this.tokenCache.store({
                identifier: token.identifier,
                target: {
                    key: token.identifier,
                    scope: token.scope,
                    factory: token.factory
                }
            })
        } else {
            throw new Error(`Invalid factory function provided while registering token ${token.identifier.toString()}`)
        }
    }

    /**
     * Register multiple tokens in container instance
     * @param tokens An array of token registration object
     */
    public registerTokens(tokens: RegisterToken[]) {
        tokens.forEach(token => {
            this.registerToken(token)
        })
    }

    private resolveToken<T>(target: TokenIdentifier, childTrace: string[] = []): Target<T> | FactoryTarget<T> {
        try {
            // retrieve target
            const cachedTarget = this.tokenCache.retrieve(target)

            if (!cachedTarget) {
                throw new Error(`Unresolved Token "${target.toString()}" in ${this.traceChild(childTrace).join(" > ")}`)
            }

            return cachedTarget
        } catch (err) {
            // delegate resolve to parent container if available
            // otherwise rethrow error
            if (this.parent) {
                return this.parent.resolveToken(target, this.traceChild(childTrace))
            }
            throw err
        }
    }

    /**
     * Resolve instance from container
     * @param target A target class or symbol
     * @returns Instance of target from container
     */
    public resolve<T>(target: Target<T> | FactoryTarget<T> | TokenIdentifier): T {
        // resolve target from token before continuing to resolve
        if (typeof target === "symbol") {
            const resolvedTarget = this.resolveToken<T>(target)
            return this.resolve<T>(resolvedTarget)
        }

        // otherwise continue to resolve target

        // resolve target from factory
        if (typeof target === "object") {
            const instanceMeta: InstanceMeta = { key: target.key, scope: target.scope }

            const cachedFactory = this.retrieveInstance<T>(instanceMeta)
            if (cachedFactory) return cachedFactory

            const instance = target.factory((t) => this.resolve(t))

            this.storeInstance(instanceMeta, instance)

            return instance
        }

        // check if caching is enabled on target
        const instanceMeta = InstanceCache.GetInstanceMeta(target)

        // retrieve and return cached instance if caching is enabled on target
        const cached = this.retrieveInstance<T>(instanceMeta)
        if (cached) return cached

        // throw error if target is a built-in constructor
        // this may be as a result of passing an argument with a primitive type
        if (arrayIncludes(target, [String, Number, BigInt, Boolean, Symbol, Object, Array, Map, Set, RegExp, Function, Date])) {
            throw new Error(`Cannot resolve built-in constructor "[${target.name}]" in ${this.name}`)
        }

        // get dependencies
        const dependencies: Dependencies = Reflect.getMetadata("design:paramtypes", target) || []

        // throw error if dependencies list does not match the constructor arguments length
        // this may be as a result of attempting to resolve a non-injectable class
        if (dependencies.length !== target.length) {
            throw new Error(`Dependency mismatch, are you sure "${target.name || "(anonymous class)"}" is injectable?`)
        }

        // get injected tokens
        const tokens = TokenCache.GetTokenMeta(target)
        const tokenKeys = Object.keys(tokens)

        // insert injected tokens in dependencies at their indexes
        if (tokenKeys.length) {
            tokenKeys.forEach(tokenKey => {
                dependencies[+tokenKey] = tokens[+tokenKey]
            })
        }

        // recursively resolve dependencies
        const injections = dependencies.map((dependency) =>
            this.resolve(dependency)
        )

        // create new instance with resolved dependencies
        const instance = new target(...injections)

        // store instance if caching is enabled
        this.storeInstance(instanceMeta, instance)

        return instance
    }

    private traceChild(childTrace: string[]) {
        return [...childTrace, this.name]
    }

    /**
     * Create a child container off of the container instance
     * @param name Child container name
     * @returns DIContainer
     */
    public createChildContainer(name: string): DIContainer {
        return new DIContainer(name, this, this.parent ? this.root : this)
    }
}

/**
 * Singleton instance of DI Container
 */
export const container = new DIContainer()

export { Scope } from "./constants"
export * from "./decorators"
export * from "./types"

