/**
 * Utilities
 * @module fbp-types/utils
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { fragments } from './types';

/** Covert undefined values to null */
export const convertNull = (value?: any) =>
  value === undefined ? null : value;

/** Check if the given type is nullable */
export const isNullable = ({ type, data }: fragments.Any): boolean => {
  switch (type) {
    case 'nullable':
      return true;

    case 'literal':
      return data === null;

    case 'named':
      return isNullable(data.type);

    case 'intersection':
      return isNullable(data.type) && isNullable(data.type2);

    case 'union':
      return isNullable(data.type) || isNullable(data.type2);
  }

  return false;
};
