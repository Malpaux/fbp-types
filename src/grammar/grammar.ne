@preprocessor typescript
@include "./utils.ne"

@{%
  export default class Fragment<TYPE extends string = string, T = any> {
    constructor(
      public type: TYPE,
      public data: T,
    ) {}
  }

  export type Union = Fragment<'union', { type: Fragment<any>, type2: Fragment<any> }>;
  export type Intersection = Fragment<'intersection', { type: Fragment<any>, type2: Fragment<any> }>;
  export type Nullable = Fragment<'nullable', Fragment<any>>;

  export type Tuple = Fragment<'tuple', { types?: Fragment<any>[] }>;
  export type ArrayFragment = Fragment<'array', { size: number, type: Fragment<any> }>;
  export type ListFragment = Fragment<'list', Fragment<any>>;
  export type Struct = Fragment<'struct', {
    types?: { [key: string]: { key: string, optional: boolean, type: Fragment<any> } },
  }>;
  export type MapFragment = Fragment<'map', { keyType: Fragment<any>, type: Fragment<any> }>;

  export type Named = Fragment<'named', {name: string, type: Fragment<any> }>;

  export type Literal = Fragment<'literal', any>;
  export type Primitive = Fragment<'primitive', string>;
  export type Generic = Fragment<'generic', { extends?: Fragment<any>, name: string }>;

  export type Any = Union | Intersection | Nullable
    | Tuple | ArrayFragment | ListFragment | Struct | MapFragment
    | Named
    | Literal | Primitive | Generic;
%}

grammar -> fragment {% unpack %}

fragment -> union {% unpack %}

union ->
  intersection {% unpack %}
| union _ "|" _ intersection {% (data: any[]): Union =>
    new Fragment('union', { type: data[0], type2: data[4] })
  %}

intersection ->
  nullable {% unpack %}
| intersection _ "&" _ nullable {% (data: any[]): Intersection =>
    new Fragment('intersection', { type: data[0], type2: data[4] })
  %}

nullable ->
  type {% unpack %}
| "?" type {% (data: any[]): Nullable => new Fragment('nullable', data[1]) %}


type ->
  simpleType {% unpack %}
  # Tuple
| "[" _ typeList:? _ "]" {% (data: any[]): Tuple => new Fragment('tuple', { types: data[2] }) %}
  # Array
| type "[" _ unsigned_int _ "]" {% (data: any[]): ArrayFragment =>
    new Fragment('array', { type: data[0], size: data[3] })
  %}
  # List
| type "[]" {% (data: any[]) => new Fragment('list', data[0]) %}
  # Struct
| "{" _ keyedTypeList:? _ "}" {% (data: any[]): Struct => {
    const object: { [key: string]: { key: string, optional: boolean, type: Fragment<any> } } = {};
    const pairs = data[2];
    pairs && pairs.forEach((pair: { key: string, optional: boolean, type: Fragment<any> }) => {
      object[pair.key] = pair;
    });
    return new Fragment('struct', { types: object })
  } %}
  # Map
| "{" _ "[" _ simpleType _ "]:" _ fragment _ "}" {% (data: any[]): MapFragment =>
    new Fragment('map', { keyType: data[4], type: data[8] })
  %}
  # Named type
| [a-z] [a-zA-Z0-9]:* "{" _ fragment:? _ "}" {% (data: any[]): Named =>
    new Fragment('named', { name: `${data[0]}${data[1].join('')}`, type: data[4] })
  %}
  # Fragments in parentheses can be evaluated to a (context-sensitive) type
| "(" _ fragment _ ")" {% (data: any[]) => data[2] %}

keyedTypeList ->
  keyTypePair
  | keyTypePair _ "," {% (data: any[]) => [data[0]] %}
  | keyTypePair _ "," _ keyedTypeList {% (data: any[]) => [data[0]].concat(data[4]) %}

keyTypePair -> [a-zA-Z0-9_]:+ _ "?":? ":" _ fragment {% (data: any[]) =>
    ({ key: data[0].join(''), optional: Boolean(data[2]), type: data[5] })
  %}

typeList ->
  type
| type _ "," {% (data: any[]) => [data[0]] %}
| type _ "," _ typeList {% (data: any[]) => [data[0]].concat(data[4]) %}

simpleType ->
  # literals
  (nullLiteral | boolean | char | number | dqstring ) {% (data: any[]): Literal =>
    new Fragment('literal', data[0][0])
  %}
  # Primitives
| ("any" | "bool" | "char" | "float" | "int" | "string" | "void") {% (data: any[]): Primitive =>
    new Fragment('primitive', data[0][0])
  %}
  # Generics
| genericName {% (data: any[]) => new Fragment('generic', { name: data[0] }) %}
| genericName _ "extends" _ nullable {% (data: any[]): Generic =>
    new Fragment('generic', { name: data[0], extends: data[4] })
  %}

genericName -> [A-Z_] [a-zA-Z0-9_]:* {% (data: any[]) => `${data[0]}${data[1].join('')}` %}
