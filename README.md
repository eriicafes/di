# DI

A simple and lightweight Dependency Injection container for TypeScript 📦

## Installation

Install with `npm`

```bash
  npm install @eriicafes/di
```

or install with `yarn`

```bash
  yarn add @eriicafes/di
```

Modify your `tsconfig.json` to include the following settings:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Add a polyfill for the Reflect API (examples below use reflect-metadata)

Install [reflect-metadata](https://www.npmjs.com/package/reflect-metadata):

```bash
npm install reflect-metadata
```

Import Reflect polyfill once at the top of the entry file for your project:

```typescript
// index.ts
import "reflect-metadata";

// your code here...
```

For other polyfills asides reflect-metadata, you may need to follow guidelines to setup the Reflect polyfill before this library can be used.

## Usage/Examples

Dependency Injection is performed on the constructors of decorated classes using [Constructor Injection](https://en.wikipedia.org/wiki/Dependency_injection#Constructor_injection)

### Decorators

#### @Injectable()

Class decorator factory that allows classes to be injected to the `DIContainer`.

```typescript
import { Injectable, Scope } from "@eriicafes/di";

@Injectable()
class Foo {
  constructor(private bar: Bar) {}
}

@Injectable(Scope.Transient) // control injection scope
class Bar {
  constructor(private baz: Baz) {}
}
```

#### @Singleton()

Wraps around @Injectable() to inject class as singleton.
By default @Injectable() also injects class as singleton so these two decorators are identical, however using this may be more explicit.

```typescript
import { Singleton } from "@eriicafes/di";

// singleton instance everywhere
@Singleton()
class Foo {
  constructor(private bar: Bar) {}
}
```

#### @LocalSingleton()

Wraps around @Injectable() to inject class as local singleton.

```typescript
import { LocalSingleton } from "@eriicafes/di";

// singleton instance per container
@LocalSingleton()
class Foo {
  constructor(private bar: Bar) {}
}
```

#### @Transient()

Wraps around @Injectable() to inject class as transient.

```typescript
import { Transient } from "@eriicafes/di";

// new instance everytime
@Transient()
class Foo {
  constructor(private bar: Bar) {}
}
```

#### @Inject()

Constructor parameter decorator factory that allows for injecting interfaces, factories or indirect classes to a class.

```typescript
import { container, Inject, Injectable } from "@erricafes/di";

// interface file
export interface Animal {
  speak(): string;
}

export const Animal = Symbol("Animal");

// concrete implementation
@Injectable()
export class Bird implements Animal {
  public speak() {
    return "humming";
  }
}

// container binding
container.registerTokens([
  {
    identifier: Animal,
    target: Bird,
  },
]);

// some other file (important stuff here)
@Injectable()
class Human {
  // the injection token is the Animal symbol
  constructor(@Inject(Animal) private pet: Animal) {}

  public playWithPet() {
    this.pet.speak();
  }
}
```

In the example above, the `Animal` interface has a concrete implementation which is the `Bird` class,
the binding is registered in the container using a javascript `Symbol` as the token and the `Bird` class as the target.

NOTE here that both the `Animal` symbol and the `Animal` interface have the same name, this does not cause any conflicts in typescript and should be the convention when binding interfaces to their concrete implementations.

### Scopes

Scopes determine the lifetime of instances.

- **Singleton (default)**

  - each resolve will return the same instance

- **Local Singleton**

  - each resolve from the same container will return the same instance
  - resolve from a parent or child container will return a different instance

- **Transient**
  - each resolve will return a new instance

### Container

The `DIContainer` stores instances of injectables so they can be resolved later and have their dependencies wired in a clean way.
The container recursively resolves classes and their dependencies and caches when applicable.
Dependencies in constructor parameters can be automatically resolved as long as they are injectable classes, for interfaces and factories the @Inject() decorator is required.

Injectable classes are classes that fit any of the categories below:

- have zero constructor parameters, **decorator not required** (may be classes from external libraries)
- have only injectable constructor parameters, **decorator required**

NOTE: classes that have dependencies in their constructors must be decorated as injectable.

#### Container Instance

A default instance is exported from this package, you may create a new instance by instantiating the `DIContainer`

```typescript
import { container, DIContainer } from "@eriicafes/di";

// create child container from exported instance
const childContainer = container.createChildContainer("ChildContainer");

// create new container instance
const newContainer = new DIContainer("NewContainer");
```

#### Token Registration

While concrete classes do not require registration,
**interfaces**, **factories** and **indirect classes** require an explicit registration to bind tokens to their concrete implementations so they can be used with the @Inject() decorator

**_factories:_**

```typescript
// factory

const FooToken = Symbol("Foo");

// does not have to be decorated with @Injectable()
// could be external class
class Foo {
  constructor(public id: string) {}
}

// container binding
container.registerToken({
  identifier: FooToken,
  factory() {
    return new Foo("id");
  },
});
```

**_interfaces:_**

```typescript
// interface

interface IBar {}

const BarToken = Symbol("Bar");

@Injectable()
class Bar implements IBar {}

// container binding
container.registerToken({
  identifier: BarToken,
  target: Bar,
});
```

**_indirect classes:_**

```typescript
// indirect class

const BazToken = Symbol("Baz");

@Injectable()
class Baz {}

// container binding
container.registerToken({
  identifier: BazToken,
  target: Baz,
});
```

**_usage:_**

```typescript
@Injectable()
class X {
  constructor(
    @Inject(FooToken) public foo: Foo,
    @Inject(BarToken) public bar: IBar,
    @Inject(BazToken) public baz: Baz
  ) {}
}
```

#### Resolution

Resolve instances from the container, the container will recursively resolve the class or token and it's dependencies.

```typescript
// Foo is a class
const foo = container.resolve(Foo);

// IBar is an interface and BarToken is a symbol
const bar = container.resolve<IBar>(BarToken);
```

#### Child Containers

Create child containers to create a tree of related containers that may share token registrations along the chain

```typescript
import { DIContainer } from "@eriicafes/di";

const parentContainer = new DIContainer("ParentContainer");
const container = parentContainer.createChildContainer("Container");
const childContainer = container.createChildContainer("ChildContainer");
```

Here child containers can resolve tokens registered in their parent containers

## Contributing

Contributions are always welcome!

## Authors

- [@eriicafes](https://www.github.com/eriicafes)
