import "reflect-metadata"
import { DIContainer, Injectable } from "../src"

describe("injections", () => {
    @Injectable()
    class Injected { }

    @Injectable()
    class InjectedWithInjectableParams {
        constructor(public child: Injected) { }
    }

    @Injectable()
    class InjectedWithOtherParams {
        constructor(public item: string) { }
    }

    class NotInjected { }

    class NotInjectedWithInjectableParams {
        constructor(public child: Injected) { }
    }

    class NotInjectedWithOtherParams {
        constructor(public item: string) { }
    }

    let container: DIContainer

    beforeAll(() => {
        container = new DIContainer()
    })

    // injectable classes
    it("should resolve injectable class with no constructor parameters", () => {
        const injected = container.resolve(Injected)

        expect(injected).toBeTruthy()
    })

    it("should resolve injectable class with injectable contructor parameters", () => {
        const injected = container.resolve(InjectedWithInjectableParams)

        expect(injected).toBeTruthy()
    })

    it("should throw error when resolving injectable class with other constructor parameters of non-injectable types", () => {
        expect(() => {
            container.resolve(InjectedWithOtherParams)
        }).toThrow()
    })

    // non injectable classes
    it("should resolve non-injectable class with no constructor parameters", () => {
        const nonInjected = container.resolve(NotInjected)

        expect(nonInjected).toBeTruthy()
    })

    it("should throw error when resolving non-injectable class with injectable contructor parameters", () => {
        expect(() => {
            container.resolve(NotInjectedWithInjectableParams)
        }).toThrow()
    })

    it("should throw error when resolving non-injectable class with other constructor parameters of non-injectable types", () => {
        expect(() => {
            container.resolve(NotInjectedWithOtherParams)
        }).toThrow()
    })

    // resuing instances
    it("should resolve and reuse instance of injectable class", () => {
        const injected = container.resolve(Injected)
        const injected2 = container.resolve(Injected)

        expect(injected).toBe(injected2)
    })

    it("should resolve but not reuse instance of non-injectable class", () => {
        const notInjected = container.resolve(NotInjected)
        const notInjected2 = container.resolve(NotInjected)

        // resolves but cannot be the same instance
        expect(notInjected).not.toBe(notInjected2)
    })
})