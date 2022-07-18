import { Target, TokenIdentifier } from "."
import { InstanceCache, TokenCache } from "./cache"
import { Scope } from "./constants"

/**
 * Decorates class as injectable
 * @param scope Injection scope, default scope is Singleton
 */
export function Injectable(scope: Scope = Scope.Singleton) {
    return (target: Target<object>) => {
        // set instance meta on target
        InstanceCache.SetInstanceMeta(target, {
            scope,
            key: Symbol(target.name)
        })
    }
}

/**
 * Explicitly decorates class as a global singleton
 */
export function Singleton() {
    return Injectable(Scope.Singleton)
}

/**
 * Explicitly decorates class as a singleton only within its immediate container
 */
export function LocalSingleton() {
    return Injectable(Scope.LocalSingleton)
}

/**
 * Explicitly decorates class as transient
 */
export function Transient() {
    return Injectable(Scope.Transient)
}

/**
 * Inject constructor parameter
 * @param identifier Token registration symbol
 */
export function Inject(identifier: TokenIdentifier) {
    return (target: Target<object>, _key: string | symbol, index: number) => {
        // register token identifier
        TokenCache.AddTokenMeta(target, index, identifier)
    }
}