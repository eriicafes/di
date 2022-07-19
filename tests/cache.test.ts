import { InstanceCache, TokenCache } from "../src/cache";

describe("cache", () => {
  const instanceCache = new InstanceCache();
  const tokenCache = new TokenCache();

  const instanceKey = Symbol();
  const tokenIdentifier = Symbol();

  describe("instance cache", () => {
    it("should store with key", () => {
      expect(instanceCache.store(instanceKey, "key1"));
    });

    it("should store with key", () => {
      expect(instanceCache.retrieve(instanceKey)).toBe("key1");
    });
  });

  describe("token cache", () => {
    class Item {}

    it("should store with key", () => {
      expect(
        tokenCache.store({
          identifier: tokenIdentifier,
          target: Item,
        })
      );
    });

    it("should store with key", () => {
      expect(tokenCache.retrieve(tokenIdentifier)).toBe(Item);
    });
  });
});
