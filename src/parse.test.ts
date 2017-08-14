/**
 * @file FBP-Type language parser test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import parse from './parse';

describe('parser', () => {
  it('should work', () => {
    expect(parse('null'));
    expect(parse('0.003'));
    expect(parse('?bool'));
    expect(parse('T'));
    expect(parse('"string" | any[]'));
    expect(parse('(int | float) & 1'));
    expect(parse('char[10]'));
    expect(parse('bool[]'));
    expect(parse('{}'));
    expect(parse('{ key: int }'));
    expect(parse('{ key: int }[]'));
    expect(parse('{ [string]: int }'));
    expect(parse('date{T extends (string | int)}'));
  });

  it('should not work', () => {
    const nodeEnv = process.env.NODE_ENV;

    expect(parse.bind(null, '')).toThrow();

    process.env.NODE_ENV = 'development';
    expect(parse.bind(null, 'nil')).toThrow();
    expect(parse.bind(null, 'bool || int')).toThrow();
    expect(parse.bind(null, 'bool && int')).toThrow();
    expect(parse.bind(null, '{ []: int }')).toThrow();

    process.env.NODE_ENV = nodeEnv;
  });
});
