# Typing solution for flow-based programing systems

[![wercker status](https://app.wercker.com/status/fba406a6e2944c091d96a63dc8a8b4e2/s/master "wercker status")](https://app.wercker.com/project/byKey/fba406a6e2944c091d96a63dc8a8b4e2)

FBP-Types provides a language specification & JavaScript library to enable platform-independent type-checking for use in distributed flow-based-programming systems.


## Install

using [yarn](https://yarnpkg.com/en/)
```shell
yarn add fbp-types
```

or npm
```shell
npm install --save fbp-types
```

## Usage
The FBP-Types JavaScript toolkit includes a parser, type checker, type matcher and some additional utilities.

### Example
#### TypeScript
```typescript
import { check, infer, match, parse, print, types } from 'fbp-types/check';

// Simple type matching & checking
console.log(match(parse('?(int | string)'), parse('?int'))); // true
console.log(match(parse('?(int | string)'), parse('bool'))); // false

console.log(check(parse('?(int | string)'), 12)); // true
console.log(check(parse('?(int | string)'), 0.3)); // false

// Type inference (print function stringifies a type AST)
console.log(print(infer('str'))); // 'string'
console.log(print(infer([1, 2, 3]))); // 'float[3]'

// Using generics
const genericsMap: types.GenericsMap = {};
console.log(match(
  parse('T extends {}'),
  parse('{ key: string }'),
  genericsMap,
  { readonlyGenerics: false },
)); // true
// 'genericsMap' will now hold a specific definition of the type 'T'

console.log(match(
  parse('T extends {}'),
  parse('{ key: string }'),
  genericsMap,
)); // true

console.log(match(
  parse('T extends {}'),
  parse('{ key: int }'),
  genericsMap,
)); // false

console.log(check(
  parse('T'),
  { key: 'some string' },
  genericsMap,
)); // true
```

#### JavaScript
```javascript
import { check, infer, match, parse } from 'fbp-types/check';

// Simple type matching & checking
console.log(match(parse('?(int | string)'), parse('?int'))); // true
console.log(match(parse('?(int | string)'), parse('bool'))); // false

console.log(check(parse('?(int | string)'), 12)); // true
console.log(check(parse('?(int | string)'), 0.3)); // false

// Type inference
console.log(infer('str')); // 'string'
console.log(infer([1, 2, 3])); // 'any[]'

// Using generics
const genericsMap = {};
console.log(match(
  parse('T extends {}'),
  parse('{ key: string }'),
  genericsMap,
  { readonlyGenerics: false },
)); // true
// 'genericsMap' will now hold a specific definition of the type 'T'

console.log(match(
  parse('T extends {}'),
  parse('{ key: string }'),
  genericsMap,
)); // true

console.log(match(
  parse('T extends {}'),
  parse('{ key: int }'),
  genericsMap,
)); // false

console.log(check(
  parse('T'),
  { key: 'some string' },
  genericsMap,
)); // true
```

## Spec
FBP-Types introduces a custom language for specifying datatypes that can be checked at runtime.

### Primitive Types
- Any (allows all types): ```any```
- Boolean: ```bool```
- Character: ```char```
- Decimal number (double floating point, if avilable): ```float```
- Integer: ```int```
- String: ```string```
- Empty packets (nothing): ```void```

### Literals
You can build types from specific values. These include:

- Null: ```null```
- Booleans: ```true```, ```false```
- Characters: e.g. ```'a'```, ```'$'```
- Numbers (integer & decimal): e.g. ```0```, ```1.75```
- Strings: e.g. ```"string"```, ```"str2"```

### Generic Types (```T [extends T2]```)
In FBP, generics work a little different than in traditional programming. They are evaluated per process and thus at runtime their concrete type is already known.

Generics start with a capital letter and may only contain alphanumeric characters.

Example: ```T```, ```Type```, ```ValidGeneric2```

You may limit which types a generic can accept by using the ```extends``` syntax: ```T extends T2``` (```T``` has to be a subset of ```T2```)

Example: ```T extends (string | bool)``` (generic ```T``` can be of type ```string```, ```bool``` or ```string | bool```, see [Unions](#unions))

### Tuples (```[T, T2, ...]```)
Tuples are sequences of typed values. In JavaScript they are implemented as fixed-structure arrays.

Example: ```[string, int]``` (double (2-tuple) with first value of type ```string``` & second of type ```int```)

### Arrays (```T[]```, ```T[n]```)
Arrays are lists containing (up to) multiple values of the same type. They are defined by appending square brackets (```[]```) to a type.

You can defined both dynamically- & statically-sized arrays:
- Dynamically-sized (variable size, "list"): ```T[]```
- Statically-sized (fixed size): ```T[n]```

Example: ```string[]``` (array of any number of strings), ```string[5]``` (array of 5 strings)

### Structs (```{ key: T, key2: T2, ... }```)
Structs are associative composed data types. (In JavaScript, think objects with a predefined structure.)

Example: ```{ type: string, data?: any }``` (struct with a key ```type``` pointing to a value of type ```string``` and an optional key ```data``` that may have a value of ```any``` type associated)

### Maps (```{ [T]: T2 }```)
Maps (dynamically) associate one value with another. (In JavaScript, they are just your good old objects.)

Example ```{ [string]: int }``` (map associating keys of type ```string``` with values of type ```int```)

### Named Types (```name{T}```)
Named types are convenience types that additionally specify the data's intent on top of its datatype. This is useful for artificial types like dates, colors, etc. that can be projected onto simpler datatypes.

Example: ```color{string}```, ```date{int}```

### Nullable Types (```?T```)
By default, all types mark a value as required (not nullable).  
If you want a typed value to be optional/nullable, prepend its type with a question mark (```?```).

Example: ```?any``` (```any``` type or ```null```)

### Intersections (```T & T2```)
Intersections let you specify that a value must comply with all of the given types.

Example: ```{ key: string } & { key2: string }``` (object/struct with keys ```key``` and ```key2``` holding values of type string)

### Unions (```T | T2```)
Unions let you specify that a value must comply with one of the given types.

Example: ```string | int``` (```string``` or ```int```)

### Parentheses (```(T)```)
Type expressions can be encapsulated using parentheses (e.g. to explicitly define operator precedence or to use them like simple types).

Example: ```(?string)[]``` (array of nullable ```string```s)

## Developing

This is what you do after you have cloned the repository:

```shell
yarn / npm install
npm run build
```

(Install dependencies & build the project.)

### Linting

Execute TSLint

```shell
npm run lint
```

Try to automatically fix linting errors
```shell
npm run lint:fix
```

### Testing

Execute Jest unit tests using

```shell
npm test

npm run test:coverage
```

Tests are defined in the same directory the module lives in. They are specified in '[module].test.js' files.

### Building

To build the project, execute

```shell
npm run build
```

This saves the production ready code into 'dist/'.

If you just want to rebuild the [nearley](https://nearley.js.org/) grammar, run

```shell
npm run nearleyc
```
