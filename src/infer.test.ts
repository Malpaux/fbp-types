/**
 * @file Type inference test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import infer from './infer';

describe('type inference', () => {
  it('should infer a value\'s type', () => {
    expect(infer(true)).toBe('bool');
    expect(infer(0)).toBe('float');
    expect(infer('Hello, world!')).toBe('string');
    expect(infer(undefined)).toBe('void');
    expect(infer([])).toBe('any[]');
    expect(infer({})).toBe('{ [any]: any }');
    expect(infer(null)).toBe('?any');
    expect(infer(Symbol())).toBe('any');
  });
});
