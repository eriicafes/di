import { arrayIncludes } from "../src/utils"

describe("utility functions", () => {
    it("should confirm array includes element", () => {
        const needle = "two"
        const haystack = ["one", needle, "three"]

        expect(arrayIncludes("one", haystack)).toBe(true)
    })
})