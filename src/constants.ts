export enum Scope {
    Singleton = "Singleton",
    LocalSingleton = "LocalSingleton",
    Transient = "Transient"
}

export const MetadataKey = {
    Instance: Symbol("__instance"),
    Tokens: Symbol("__tokens")
}