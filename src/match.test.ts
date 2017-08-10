/**
 * @file Type matcher test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import Fragment from './grammar';
import parse from './parse';
import { GenericsMap } from './types';

import match from './match';

describe('type matcher', () => {
  it('should match literal types', () => {
    expect(match(parse('null'), parse('null'))).toBe(true);
    expect(match(parse('true'), parse('true'))).toBe(true);
    expect(match(parse('1'), parse('1'))).toBe(true);
    expect(match(parse('"string"'), parse('"string"'))).toBe(true);
    expect(match(parse('string'), parse('"string"'))).toBe(true);
    expect(match(parse('int'), parse('0'))).toBe(true);

    expect(match(parse('1'), parse('"1"'))).toBe(false);
    expect(match(parse('int'), parse('"1"'))).toBe(false);
  });

  it('should match primitive types', () => {
    expect(match(parse('any'), parse('any'))).toBe(true);
    expect(match(parse('any'), parse('int'))).toBe(true);
    expect(match(parse('any'), parse('any[]'))).toBe(true);
    expect(match(parse('any'), parse('{}'))).toBe(true);
    expect(match(parse('int'), parse('int'))).toBe(true);
    expect(match(parse('float'), parse('float'))).toBe(true);

    expect(match(parse('any'), parse('?any'))).toBe(false);
    expect(match(parse('any'), parse('?float'))).toBe(false);
    expect(match(parse('bool'), parse('float'))).toBe(false);
  });

  it('should match received generics', () => {
    expect(match(parse('bool'), parse('T extends bool'))).toBe(true);
    expect(match(parse('any'), parse('T extends (string | int)'))).toBe(true);
    expect(match(parse('?any'), parse('T'))).toBe(true);

    expect(match(parse('any'), parse('T'))).toBe(false);
    expect(match(parse('int'), parse('T extends string'))).toBe(false);
  });

  it('should match receiving generics', () => {
    expect(match(parse('T'), parse('?any'), undefined, { readonlyGenerics: false })).toBe(true);
    expect(match(
      parse('T extends (int | string)'),
      parse('int'),
      undefined,
      { readonlyGenerics: false },
    )).toBe(true);

    const genericsMap: GenericsMap = {};

    expect(match(
      parse('T extends (int | string)'),
      parse('bool'),
      genericsMap,
      { readonlyGenerics: false },
    )).toBe(false);
    expect(match(
      parse('T extends (int | string)'),
      parse('int'),
      genericsMap,
      { readonlyGenerics: false },
    )).toBe(true);
    expect(genericsMap.T).toEqual(new Fragment('primitive', 'int'));

    expect(match(
      parse('T extends (int | string)'),
      parse('bool'),
      genericsMap,
      { readonlyGenerics: false },
    )).toBe(false);
    expect(match(
      parse('T extends (int | string)'),
      parse('int'),
      genericsMap,
      { readonlyGenerics: false },
    )).toBe(true);
    expect(genericsMap.T).toEqual(new Fragment('primitive', 'int'));

    expect(match(
      parse('T extends (int | string)'),
      parse('string'),
      genericsMap,
      { readonlyGenerics: false },
    )).toBe(true);
    expect(genericsMap.T).toEqual(new Fragment('union', {
      type: new Fragment('primitive', 'int'),
      type2: new Fragment('primitive', 'string'),
    }));

    expect(match(
      parse('T'),
      parse('string | int'),
      genericsMap,
      { readonlyGenerics: false },
    )).toBe(true);
    expect(genericsMap.T).toEqual(new Fragment('union', {
      type: new Fragment('primitive', 'int'),
      type2: new Fragment('primitive', 'string'),
    }));
  });

  it('should match receiving readonly generics', () => {
    expect(match(parse('T'), parse('?any'))).toBe(true);
    expect(match(parse('T extends (int | string)'), parse('int'))).toBe(true);
    expect(match(parse('T'), parse('?any'), {})).toBe(true);
    expect(match(parse('T'), parse('int'), { T: parse('int | float') })).toBe(true);
    expect(match(parse('T extends any'), parse('int'), { T: parse('int | float') })).toBe(true);

    expect(match(parse('T extends (int | string)'), parse('bool'))).toBe(false);
    expect(match(parse('T extends any'), parse('?any'), {})).toBe(false);
    expect(match(parse('T'), parse('string'), { T: parse('int | float') })).toBe(false);
    expect(match(parse('T extends any'), parse('string'), { T: parse('int | float') })).toBe(false);
  });

  it('should match tuples', () => {
    expect(match(parse('[any, any]'), parse('[int, float]'))).toBe(true);
    expect(match(parse('[int, float]'), parse('[int, float]'))).toBe(true);

    expect(match(parse('[int, float]'), parse('[float, int]'))).toBe(false);
    expect(match(parse('[int, float]'), parse('[int, float, bool]'))).toBe(false);
    expect(match(parse('[int, float, char]'), parse('[int, float]'))).toBe(false);
  });

  it('should match arrays', () => {
    expect(match(parse('any[4]'), parse('any[4]'))).toBe(true);
    expect(match(parse('any[5]'), parse('int[5]'))).toBe(true);
    expect(match(parse('string[10]'), parse('string[10]'))).toBe(true);

    expect(match(parse('int[2]'), parse('float[2]'))).toBe(false);
    expect(match(parse('int[1]'), parse('int'))).toBe(false);
    expect(match(parse('int[1]'), parse('int[3]'))).toBe(false);
    expect(match(parse('int[3]'), parse('int[2]'))).toBe(false);
  });

  it('should match lists', () => {
    expect(match(parse('any[]'), parse('any[]'))).toBe(true);
    expect(match(parse('any[]'), parse('int[]'))).toBe(true);
    expect(match(parse('string[]'), parse('string[]'))).toBe(true);

    expect(match(parse('int[]'), parse('float[]'))).toBe(false);
    expect(match(parse('int[]'), parse('int'))).toBe(false);
  });

  it('should match structs', () => {
    expect(match(parse('{}'), parse('{}'))).toBe(true);
    expect(match(parse('{}'), parse('{ key: string }'))).toBe(true);
    expect(match(
      parse('{ key: string, key2: int, key3?: bool }'),
      parse('{ key: string, key2: int, key3: bool }'),
    )).toBe(true);
    expect(match(
      parse('{ key: string, key2: int, key3?: bool }'),
      parse('{ key: string, key2: int, key3?: bool }'),
    )).toBe(true);
    expect(match(
      parse('{ key: string, key2: int, key3?: bool }'),
      parse('{ key: string, key2: int }'),
    )).toBe(true);

    expect(match(
      parse('{ key: string, key2: int, key3?: bool }'),
      parse('{ key: string, key3: bool }'),
    )).toBe(false);
    expect(match(
      parse('{ key: string, key2: int, key3?: bool }'),
      parse('{ key: float, key2: int, key3: bool }'),
    )).toBe(false);
    expect(match(
      parse('{ key: string }'),
      parse('string'),
    )).toBe(false);
  });

  it('should match maps', () => {
    expect(match(parse('{ [string]: string }'), parse('{ [string]: string }'))).toBe(true);
    expect(match(parse('{ [string]: string | int }'), parse('{ [string]: int }'))).toBe(true);

    expect(match(parse('{ [string]: string }'), parse('{ [string]: int }'))).toBe(false);
    expect(match(parse('{ [int]: string }'), parse('{ [string]: string }'))).toBe(false);
    expect(match(parse('{ [int]: string }'), parse('{ key: string }'))).toBe(false);
    expect(match(parse('{ [int]: string }'), parse('string'))).toBe(false);
  });

  it('should match named types', () => {
    expect(match(parse('date{}'), parse('date{}'))).toBe(true);
    expect(match(parse('date{int}'), parse('date{int}'))).toBe(true);
    expect(match(parse('date{string | int}'), parse('date{string}'))).toBe(true);
    expect(match(parse('date{string | int}'), parse('date{int | string}'))).toBe(true);
    expect(match(parse('int'), parse('date{int}'))).toBe(true);

    expect(match(parse('date{int}'), parse('int'))).toBe(false);
    expect(match(parse('float'), parse('date{int}'))).toBe(false);
    expect(match(parse('date{string}'), parse('date{int}'))).toBe(false);
    expect(match(parse('color{string}'), parse('date{string}'))).toBe(false);
  });

  it('should match nullables', () => {
    expect(match(parse('?int'), parse('?int'))).toBe(true);
    expect(match(parse('?int'), parse('int'))).toBe(true);
    expect(match(parse('?int'), parse('null'))).toBe(true);

    expect(match(parse('int'), parse('?int'))).toBe(false);
    expect(match(parse('?int'), parse('?string'))).toBe(false);
    expect(match(parse('?int'), parse('string'))).toBe(false);
  });

  it('should match intersections', () => {
    expect(match(
      parse('{ key: string } & { key2: string }'),
      parse('{ key: string, key2: string }'),
    )).toBe(true);
    expect(match(
      parse('{ key: string } & { key2: string }'),
      parse('{ key: string } & { key2: string }'),
    )).toBe(true);
    expect(match(
      parse('{ key: string }'),
      parse('{ key: string } & { key2: string }'),
    )).toBe(true);
    expect(match(
      parse('any[4] & int[4]'),
      parse('int[4]'),
    )).toBe(true);

    expect(match(parse('?(any[] & int[])'), parse('any[] & ?int[]'))).toBe(true);
    expect(match(parse('?(any[] & int[])'), parse('?(any[] & int[])'))).toBe(true);
    expect(match(parse('any[] & ?int[]'), parse('any[] & ?int[]'))).toBe(true);
    expect(match(parse('any[] & int[]'), parse('?any[] & int[]'))).toBe(true);

    expect(match(
      parse('{ key: string } & { key2: string }'),
      parse('{ key: string }'),
    )).toBe(false);
    expect(match(
      parse('any[4] & int[]'),
      parse('int[]'),
    )).toBe(false);
    expect(match(parse('any[] & int[]'), parse('?(any[] & int[])'))).toBe(false);
    expect(match(parse('any[] & int[]'), parse('?any[] & ?int[]'))).toBe(false);
  });

  it('should match unions', () => {
    expect(match(parse('int | string | char'), parse('string'))).toBe(true);
    expect(match(parse('int | string | char'), parse('int'))).toBe(true);
    expect(match(parse('int | string | char'), parse('char'))).toBe(true);
    expect(match(parse('int | string | char'), parse('char | int'))).toBe(true);
    expect(match(parse('(int | string) | char | bool'), parse('int | (string | char)'))).toBe(true);

    expect(match(parse('?int | ?bool'), parse('?(bool | int)'))).toBe(true);
    expect(match(parse('?int | bool'), parse('?(bool | int)'))).toBe(true);
    expect(match(parse('?(int | bool)'), parse('bool | ?int'))).toBe(true);

    expect(match(parse('int | string | char'), parse('int | bool'))).toBe(false);
  });

  xit('should work', () => {
    expect(match(parse('true | false'), parse('bool'))).toBe(true);
  });

  it('should do nothing for unknown types', () => {
    expect(match(new Fragment('undef', {}) as any, new Fragment('undef', {}) as any)).toBe(false);
  });
});
