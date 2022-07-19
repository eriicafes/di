import "reflect-metadata";
import { DIContainer, Injectable } from "../src";

describe("child container", () => {
  interface Human {
    breathe(): string;
  }
  const Human = Symbol("Human");

  interface Vehicle {
    move(): string;
  }
  const Vehicle = Symbol("Vehicle");

  @Injectable()
  class Man implements Human {
    public breathe(): string {
      return "breathing";
    }
  }

  @Injectable()
  class Car implements Vehicle {
    public move(): string {
      return "moving";
    }
  }

  let container: DIContainer;
  let childContainer: DIContainer;

  beforeAll(() => {
    container = new DIContainer();

    container.registerTokens([
      {
        identifier: Human,
        target: Man,
      },
    ]);

    childContainer = container.createChildContainer("ChildContainer");

    childContainer.registerTokens([
      {
        identifier: Vehicle,
        target: Car,
      },
    ]);
  });

  it("should resolve token registered on a parent container", () => {
    const human = childContainer.resolve<Human>(Human);

    expect(human).toBeTruthy();
  });

  it("should throw error when resolving a token registered only on a child container", () => {
    expect(() => {
      container.resolve<Vehicle>(Vehicle);
    }).toThrow();
  });
});
