import "reflect-metadata";
import { DIContainer, Injectable, Scope } from "../src";

describe("resolve with factory", () => {
  class Meter {
    constructor(public initial: string) {}

    public read() {
      return this.initial;
    }
  }
  const MeterKey = Symbol("Meter");

  @Injectable()
  class Vehicle {
    public speed(): string {
      return "30km/h";
    }
  }

  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  it("should register with factory", () => {
    container.registerToken({
      identifier: MeterKey,
      scope: Scope.Singleton,
      factory(resolve) {
        const vehicle = resolve(Vehicle);

        return new Meter(vehicle.speed());
      },
    });

    const meter = container.resolve<Meter>(MeterKey);
    expect(meter).toBeTruthy();

    const vehicle = container.resolve(Vehicle);
    expect(meter.read()).toBe(vehicle.speed());
  });

  it("should return same instance for singleton registered with factory", () => {
    container.registerToken({
      identifier: MeterKey,
      scope: Scope.Singleton,
      factory(resolve) {
        const vehicle = resolve(Vehicle);

        return new Meter(vehicle.speed());
      },
    });

    const meter1 = container.resolve<Meter>(MeterKey);
    const meter2 = container.resolve<Meter>(MeterKey);

    expect(meter1).toBe(meter2);
  });

  it("should return different instances for transients registered with factory", () => {
    container.registerToken({
      identifier: MeterKey,
      scope: Scope.Transient,
      factory(resolve) {
        const vehicle = resolve(Vehicle);

        return new Meter(vehicle.speed());
      },
    });

    const meter1 = container.resolve<Meter>(MeterKey);
    const meter2 = container.resolve<Meter>(MeterKey);

    expect(meter1).not.toBe(meter2);
  });
});
