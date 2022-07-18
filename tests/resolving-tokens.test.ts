import { DIContainer } from "../src"

describe("resolving tokens", () => {
    interface Item {
        use(): void
    }
    const Item = Symbol("Item")

    class MainItem implements Item {
        use() { }
    }
    class ChildItem implements Item {
        use() { }
    }

    let grandParentContainer: DIContainer
    let parentContainer: DIContainer
    let mainContainer: DIContainer
    let childContainer: DIContainer
    let grandChildContainer: DIContainer

    beforeAll(() => {
        grandParentContainer = new DIContainer("GrandParentContainer")
        parentContainer = grandParentContainer.createChildContainer("ParentContainer")
        mainContainer = parentContainer.createChildContainer("MainContainer")
        childContainer = parentContainer.createChildContainer("ChildContainer")
        grandChildContainer = childContainer.createChildContainer("GrandChildContainer")

        mainContainer.registerTokens([
            {
                identifier: Item,
                target: MainItem
            }
        ])

        childContainer.registerTokens([
            {
                identifier: Item,
                target: ChildItem
            }
        ])
    })

    it("should recursively resolve tokens registered in container or parent containers", () => {
        const item = grandChildContainer.resolve<Item>(Item)

        expect(item).toBeTruthy()
    })

    it("should use token registered in nearest container if not registerd in container", () => {
        const item = grandChildContainer.resolve<Item>(Item)

        expect(item).toBeInstanceOf(ChildItem)
    })

    it("should use token registered in container over tokens registered in parent containers", () => {
        const item = childContainer.resolve<Item>(Item)

        expect(item).toBeInstanceOf(ChildItem)
    })

    it("should throw error when resolving tokens not registered in container or parent but only in child containers", () => {
        expect(() => {
            parentContainer.resolve<Item>(Item)
        }).toThrow()
    })
})