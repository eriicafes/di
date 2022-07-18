import "reflect-metadata"
import { container as rootContainer, DIContainer, Inject, Injectable, LocalSingleton, Transient } from "../src"

describe("container instances", () => {
    // simulate cooking in a kitchen
    interface IPot {
        open(): string,
        close(): string,
    }
    const IPot = Symbol("IPot")

    // reuse same pot for every instance
    @LocalSingleton()
    class Pot implements IPot {
        public open() {
            return "opening pot"
        }

        public close() {
            return "closing pot"
        }
    }

    // use new set of knives for every instance
    @Transient()
    class Knives {
        chop(vegetables: string) {
            return "chopping " + vegetables
        }
    }

    @Injectable()
    class Chef {
        constructor(public favoriteKnives: Knives, public otherKnives: Knives) { }

        public cook(pot: IPot): string[] {
            return [pot.open(), this.favoriteKnives.chop("onions"), "cooking", pot.close()]
        }
    }

    @Injectable()
    class Kitchen {
        constructor(
            public lastChef: Chef,
            public newChef: Chef,
            @Inject(IPot) public pot: IPot,
        ) { }

        public prepareMeal() {
            return this.newChef.cook(this.pot)
        }
    }

    let container: DIContainer

    beforeAll(() => {
        rootContainer.registerTokens([
            {
                identifier: IPot,
                target: Pot
            }
        ])

        container = rootContainer.createChildContainer("TestContainer")
    })

    // singletons
    it("should return same instance when resolving singleton class", () => {
        const kitchen = container.resolve(Kitchen)
        const kitchen2 = container.resolve(Kitchen)

        expect(kitchen).toBe(kitchen2)
    })

    it("should return same instance when resolving singleton class using class and token", () => {
        const pot = container.resolve(Pot)
        const potFromToken = container.resolve<IPot>(IPot)

        expect(pot).toBe(potFromToken)
    })

    it("should have same instance of singleton dependencies", () => {
        const kitchen = container.resolve(Kitchen)

        expect(kitchen.newChef).toBe(kitchen.lastChef)
    })

    it("should have same instance of singleton dependencies across different instances", () => {
        const kitchen = container.resolve(Kitchen)
        const kitchen2 = container.resolve(Kitchen)

        expect(kitchen.newChef).toBe(kitchen.lastChef)
    })

    it("should return same instance of singleton dependencies from different nested containers", () => {
        const kitchen = container.resolve(Kitchen)
        const kitchenFromRoot = rootContainer.resolve(Kitchen)

        expect(kitchen).toBe(kitchenFromRoot)
    })

    // transients
    it("should return different instance of transient dependencies", () => {
        const chef = container.resolve(Chef)

        expect(chef.favoriteKnives).not.toBe(chef.otherKnives)
    })

    // local singletons
    it("should return different instances of local singleton from different containers", () => {
        const pot = container.resolve<IPot>(IPot)
        const potFromRoot = rootContainer.resolve<IPot>(IPot)

        expect(pot).not.toBe(potFromRoot)
    })
})