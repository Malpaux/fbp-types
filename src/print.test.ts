/**
 * @file Type printer test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import parse from './parse';

import print from './print';

describe('type printer', () => {
  it('should print literal types', () => {
    expect(print(parse('"string"'))).toBe('"string"');
    expect(print(parse('null'))).toBe('null');
    expect(print(parse('1.25'))).toBe('1.25');
  });

  it('should print primitive types', () => {
    expect(print(parse('string'))).toBe('string');
    expect(print(parse('any'))).toBe('any');
  });

  it('should print generics', () => {
    expect(print(parse('T'))).toBe('T');
    expect(print(parse('T2 extends string'))).toBe('T2 extends string');
  });

  it('should print tuples', () => {
    expect(print(parse('[]'))).toBe('[]');
    expect(print(parse('[float, int, bool]'))).toBe('[float, int, bool]');
  });

  it('should print arrays', () => {
    expect(print(parse('int[4]'))).toBe('int[4]');
    expect(print(parse('(?(int | float))[4]'))).toBe('(?(int | float))[4]');
  });

  it('should print lists', () => {
    expect(print(parse('any[]'))).toBe('any[]');
    expect(print(parse('(?bool)[]'))).toBe('(?bool)[]');
  });

  it('should print structs', () => {
    expect(print(parse('{}'))).toBe('{}');
    expect(print(parse('{ key: string, key2?: int }'))).toBe('{ key: string, key2?: int }');
  });

  it('should print maps', () => {
    expect(print(parse('{ [string]: int }'))).toBe('{ [string]: int }');
  });

  it('should named types', () => {
    expect(print(parse('color{}'))).toBe('color{}');
    expect(print(parse('date{string | int}'))).toBe('date{string | int}');
  });

  it('should print nullable types', () => {
    expect(print(parse('?int'))).toBe('?int');
    expect(print(parse('?(float | int)'))).toBe('?(float | int)');
  });

  it('should print intersections', () => {
    expect(print(parse('{} & { key: string } & { key2: int }')))
      .toBe('{} & { key: string } & { key2: int }');
  });

  it('should print unions', () => {
    expect(print(parse('int | bool | float'))).toBe('int | bool | float');
  });

  it('should return ?any for unknown types', () => {
    expect(print({ type: 'undef' } as any)).toBe('?any');
  });
});
