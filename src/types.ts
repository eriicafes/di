import { Scope } from "./constants"

export type Target<T = any> = new (...args: any[]) => T

export type FactoryTarget<T = any> = { key: InstanceKey, scope: Scope, factory: (resolve: Resolver) => T }

export type InstanceKey = symbol

export type InstanceMeta = { key: InstanceKey, scope: Scope }

export type TokenIdentifier = symbol

export type Token = { identifier: TokenIdentifier, target: Target | FactoryTarget }

export type TokenMeta = Record<number, TokenIdentifier>

export type Resolver = <T>(target: symbol | Target<T>) => T

export type RegisterToken<T = any> =
    | { identifier: TokenIdentifier, target: Target<T>, factory?: never, scope?: never }
    | { identifier: TokenIdentifier, target?: never, factory: (resolve: Resolver) => T, scope: Scope }

export type Dependencies = (Target | TokenIdentifier)[]
