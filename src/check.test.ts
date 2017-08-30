/**
 * @file Type checker test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import Fragment from './grammar';
import parse from './parse';

import check from './check';

describe('type checker', () => {
  it('should check literal types', () => {
    expect(check(parse('null'), null)).toBe(true);
    expect(check(parse('3'), 3)).toBe(true);
    expect(check(parse('"3"'), '3')).toBe(true);
    expect(check(parse('false'), false)).toBe(true);

    expect(check(parse('null'), undefined)).toBe(false);
    expect(check(parse('"3"'), 3)).toBe(false);
  });

  it('should check primitive types', () => {
    expect(check(parse('any'), [])).toBe(true);
    expect(check(parse('any'), 0)).toBe(true);
    expect(check(parse('any'), 'string')).toBe(true);
    expect(check(parse('bool'), true)).toBe(true);
    expect(check(parse('char'), 'c')).toBe(true);
    expect(check(parse('int'), 0)).toBe(true);
    expect(check(parse('float'), 1)).toBe(true);
    expect(check(parse('float'), 0.32)).toBe(true);

    expect(check(parse('bool'), 0)).toBe(false);
    expect(check(parse('char'), 'str')).toBe(false);
    expect(check(parse('int'), 1.2)).toBe(false);
  });

  it('should check generics', () => {
    expect(check(parse('T'), 0)).toBe(true);
    expect(check(parse('T extends ?int'), 0)).toBe(true);
    expect(check(parse('T extends ?(char | bool)'), null)).toBe(true);
    expect(check(parse('T'), 'str', { T: parse('string') })).toBe(true);
    expect(check(parse('T'), 'str', {})).toBe(true);
    expect(check(parse('T extends int'), 12, {})).toBe(true);

    expect(check(parse('T'), 12, { T: parse('string') })).toBe(false);
    expect(check(parse('T extends int'), 'str', {})).toBe(false);
  });

  it('should check tuples', () => {
    expect(check(parse('[string, int]'), ['str', 1])).toBe(true);
    expect(check(parse('[]'), [])).toBe(true);

    expect(check(parse('[]'), [0])).toBe(false);
    expect(check(parse('[string, int]'), [1, 'str'])).toBe(false);
    expect(check(parse('[string, int]'), ['str'])).toBe(false);
    expect(check(parse('[string, int]'), ['str', 1, 1])).toBe(false);
    expect(check(parse('[string]'), 'str')).toBe(false);
  });

  it('should check arrays', () => {
    expect(check(parse('string[4]'), ['str', 'str2', 'str3', 'str4'])).toBe(true);
    expect(check(parse('(?string)[4]'), ['str', 'str2', null, null])).toBe(true);

    expect(check(parse('string[1]'), ['str', 'str2'])).toBe(false);
    expect(check(parse('string[3]'), ['str', 'str2', 'str3', 'str4'])).toBe(false);
    expect(check(parse('string[4]'), ['str', 'str2', 1, 'str4'])).toBe(false);
    expect(check(parse('string[1]'), 'str')).toBe(false);
  });

  it ('should check lists', () => {
    expect(check(parse('string[]'), [])).toBe(true);
    expect(check(parse('string[]'), ['str'])).toBe(true);
    expect(check(parse('string[]'), ['str', 'str2', 'str3', 'str4'])).toBe(true);

    expect(check(parse('string[]'), ['str', 0, 'str3'])).toBe(false);
    expect(check(parse('string[]'), ['str', 'str2', undefined])).toBe(false);
    expect(check(parse('string[]'), 'str')).toBe(false);
  });

  it('should check structs', () => {
    expect(check(parse('{}'), {})).toBe(true);
    expect(check(parse('{}'), { key: 'string' })).toBe(true);
    expect(check(parse('{ key: string }'), { key: 'string' })).toBe(true);
    expect(check(
      parse('{ key: (float | string) } & { key2: int, key3: ?bool, key4?: char, }'),
      { key: 3.5, key2: 7, key3: false, key5: 'str' },
    )).toBe(true);

    expect(check(parse('{ key: string }'), { key: true })).toBe(false);
    expect(check(parse('{ key: string }'), {})).toBe(false);
    expect(check(parse('{ key: string }'), 'string')).toBe(false);
  });

  it('should check maps', () => {
    expect(check(parse('{ [string]: string }'), {})).toBe(true);
    expect(check(parse('{ [string]: ?string }'), {
      key: 'string',
      key2: null,
      key3: 'string2',
    })).toBe(true);

    expect(check(parse('{ [string]: string }'), { key: 'string', key2: 1 })).toBe(false);
    expect(check(parse('{ [string]: string }'), 'string')).toBe(false);
  });

  it('should check named types', () => {
    expect(check(parse('color{string}'), '#fff')).toBe(true);
    expect(check(parse('date{}'), 0)).toBe(true);

    expect(check(parse('color{string}'), 255)).toBe(false);

    // Custom checkers
    expect(check(
      parse('color{string}'),
      '#fff',
      undefined,
      { color: (col: string) => col === '#fff' },
    )).toBe(true);
    expect(check(
      parse('color{string}'),
      '#000',
      undefined,
      { color: (col: string) => col === '#fff' },
    )).toBe(false);
  });

  it('should check nullables', () => {
    expect(check(parse('?bool'), null)).toBe(true);
    expect(check(parse('?bool'), false)).toBe(true);
  });

  it('should check intersections', () => {
    expect(check(parse('{ key: string } & { key2: string }'), {
      key: 'string',
      key2: 'string2',
      key3: 'string3',
    })).toBe(true);
    expect(check(parse('(any[2] & int[2]) & any[2]'), [1, 3])).toBe(true);

    expect(check(parse('{ key: string } & { key2: string }'), {
      key: 'string',
      key3: 'string3',
    })).toBe(false);
    expect(check(parse('{ key: string } & { key2: string }'), {
      key: 'string',
      key2: false,
      key3: 'string3',
    })).toBe(false);
  });

  it('should check unions', () => {
    expect(check(parse('string | void'), 'ok')).toBe(true);
    expect(check(parse('string | void'), undefined)).toBe(true);
    expect(check(parse('string | void | char | bool'), 'c')).toBe(true);

    expect(check(parse('string | void'), true)).toBe(false);
  });

  it('should do nothing for unknown types', () => {
    expect(check(new Fragment('undef', {}) as any, 'str')).toBe(false);
  });
});
