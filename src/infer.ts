/**
 * Type inference helper
 * @module fbp-types/infer
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

 /** Infer a value's datatype */
const infer = (value: any): string => {
  if (value === undefined) return 'void';
  if (value === null) return '?any';

  switch (typeof value) {
    case 'boolean':
      return 'bool';

    case 'number':
      return 'float';

    case 'string':
      return 'string';

    case 'object':
      if (Array.isArray(value)) return '(?any)[]';
      return '{ [?any]: ?any }';
  }

  return '?any';
};

export default infer;
