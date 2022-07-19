import {
  DIContainer,
  Injectable,
  LocalSingleton,
  Singleton,
  Transient,
} from "../src";

describe("scopes", () => {
  // instance scopes
  @Singleton()
  class SingletonItem {}

  @LocalSingleton()
  class LocalSingletonItem {}

  @Transient()
  class TransientItem {}

  // resolution
  @Singleton()
  class SingletonDeepItem {
    constructor(public x: SingletonItem, public y: TransientItem) {}
  }

  @Transient()
  class TransientDeepItem {
    constructor(public x: SingletonItem, public y: TransientItem) {}
  }

  @Injectable()
  class CompoundItem {
    constructor(public a: SingletonDeepItem, public b: TransientDeepItem) {}
  }

  let parentContainer: DIContainer;
  let childContainer: DIContainer;

  beforeAll(() => {
    parentContainer = new DIContainer("ParentContainer");
    childContainer = parentContainer.createChildContainer("ChildContainer");
  });

  // instance scopes
  it("should resolve same instance of singletons", () => {
    const singletonItem1 = parentContainer.resolve(SingletonItem);
    const singletonItem2 = parentContainer.resolve(SingletonItem);

    expect(singletonItem1).toBe(singletonItem2);
  });

  it("should resolve same instance of singletons across different but related containers", () => {
    const singletonItem1 = parentContainer.resolve(SingletonItem);
    const singletonItem2 = childContainer.resolve(SingletonItem);

    expect(singletonItem1).toBe(singletonItem2);
  });

  it("should resolve same instance of local singletons in same container", () => {
    const localSingletonItem1 = childContainer.resolve(LocalSingletonItem);
    const localSingletonItem2 = childContainer.resolve(LocalSingletonItem);

    expect(localSingletonItem1).toBe(localSingletonItem2);
  });

  it("should resolve different instances of local singletons in different but related containers", () => {
    const localSingletonItem1 = parentContainer.resolve(LocalSingletonItem);
    const localSingletonItem2 = childContainer.resolve(LocalSingletonItem);

    expect(localSingletonItem1).not.toBe(localSingletonItem2);
  });

  it("should resolve different instances of transients", () => {
    const transientItem1 = parentContainer.resolve(TransientItem);
    const transientItem2 = parentContainer.resolve(TransientItem);

    expect(transientItem1).not.toBe(transientItem2);
  });

  // resolution
  it("uses same instance for nested singleton dependencies", () => {
    const comp1 = parentContainer.resolve(CompoundItem);
    const comp2 = parentContainer.resolve(CompoundItem);

    expect(comp1.a).toBe(comp2.a);
  });

  it("uses same instance for deeply nested singleton dependencies", () => {
    const comp1 = parentContainer.resolve(CompoundItem);
    const comp2 = parentContainer.resolve(CompoundItem);

    expect(comp1.a.x).toBe(comp2.a.x);
  });

  it("uses same instance for deeply nested singleton dependencies injected into transients", () => {
    const comp1 = parentContainer.resolve(CompoundItem);
    const comp2 = parentContainer.resolve(CompoundItem);

    expect(comp1.a.x).toBe(comp2.b.x);
  });

  it("uses same instance for deeply nested singleton dependencies injected into transients in same class instance", () => {
    const comp = parentContainer.resolve(CompoundItem);

    expect(comp.a.x).toBe(comp.b.x);
  });
});
