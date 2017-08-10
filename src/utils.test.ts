/**
 * @file Utilities test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import parse from './parse';

import { convertNull, isNullable, oneOf } from './utils';

describe('utilities', () => {
  it('should covert undefined values to null', () => {
    expect(convertNull(undefined)).toBe(null);
    expect(convertNull(null)).toBe(null);
    expect(convertNull(1)).toBe(1);
    expect(convertNull('str')).toBe('str');
  });

  it('should check if the given type is nullable', () => {
    expect(isNullable(parse('null'))).toBe(true);
    expect(isNullable(parse('?any'))).toBe(true);
    expect(isNullable(parse('color{?string}'))).toBe(true);
    expect(isNullable(parse('?{ key: string } & ?{} & ?{ key2: int }'))).toBe(true);
    expect(isNullable(parse('int | ?float | bool'))).toBe(true);

    expect(isNullable(parse('0'))).toBe(false);
    expect(isNullable(parse('any'))).toBe(false);
    expect(isNullable(parse('int[]'))).toBe(false);
    expect(isNullable(parse('?{ key: string } & {} & ?{ key2: int }'))).toBe(false);
    expect(isNullable(parse('int | float | bool'))).toBe(false);
  });
});
