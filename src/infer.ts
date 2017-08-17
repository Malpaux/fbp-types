/**
 * Type inference helper
 * @module fbp-types/infer
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import Fragment from './grammar';
import match from './match';
import { fragments } from './types';

/** Infer a value's datatype */
const infer = (value: any): fragments.Any => {
  if (value === undefined) return new Fragment('primitive', 'void');
  if (value === null) return new Fragment('literal', null);

  switch (typeof value) {
    case 'boolean':
      return new Fragment('primitive', 'bool');

    case 'number':
      return new Fragment('primitive', 'float');

    case 'string':
      return new Fragment('primitive', 'string');

    case 'object':
      if (Array.isArray(value)) {
        const { length } = value;
        if (!length) return new Fragment('tuple', null);

        const types = value.map(infer);
        const firstType = types[0];

        // Types differ -> Tuple
        if (~types.findIndex((type) =>
          !(type.type === 'primitive' && type.data === 'void' || match(firstType, type)),
        )) {
          return new Fragment('tuple', types);
        }

        // All values of the same type -> Array
        return new Fragment('array', { type: firstType, size: length });
      }

      const keys = Object.keys(value);
      if (!keys.length) return new Fragment('struct', null);

      const object: fragments.Struct['data'] = {};
      keys.forEach((key) => {
        object[key] = { type: infer(value[key]) };
      });
      return new Fragment('struct', object);
  }

  return new Fragment('primitive', 'any');
};

export default infer;
