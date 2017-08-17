/**
 * @file Type inference test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import match from './match';
import parse from './parse';

import infer from './infer';

describe('type inference', () => {
  it('should infer a value\'s type', () => {
    expect(match(infer(true), parse('bool'))).toBe(true);
    expect(match(infer(0), parse('float'))).toBe(true);
    expect(match(infer('Hello, world!'), parse('string'))).toBe(true);
    expect(match(infer(undefined), parse('void'))).toBe(true);
    expect(match(infer([]), parse('[]'))).toBe(true);
    expect(match(infer([0, 'string']), parse('[float, string]'))).toBe(true);
    expect(match(infer([0, 1, 2, 3]), parse('float[4]'))).toBe(true);
    expect(match(infer([0, 1, undefined, undefined]), parse('float[4]'))).toBe(true);
    expect(match(
      infer([{ key: 0, key2: null }, { key2: null, key: 12 }]),
      parse('{ key: float, key2: null }[2]'),
    )).toBe(true);
    expect(match(infer({}), parse('{}'))).toBe(true);
    expect(match(
      infer({ key: 2.3, key2: false, key3: [] }),
      parse('{ key: float, key2: bool, key3: [] }'),
    )).toBe(true);
    expect(match(infer(null), parse('null'))).toBe(true);
    expect(match(infer(Symbol()), parse('any'))).toBe(true);
  });
});
