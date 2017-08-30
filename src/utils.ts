/**
 * Utilities
 * @module fbp-types/utils
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { fragments } from './types';

/** Covert undefined values to null */
export const convertNull = <T>(value?: T, removeUndefinedFields?: boolean): T | null => {
  // If value is undefined or null, return null
  if (value === undefined || value === null) return null;

  // Recursively convert arrays
  if (Array.isArray(value)) {
    return value.map((currentValue) =>
      convertNull(currentValue, removeUndefinedFields),
    ) as any as T;
  }

  // Recursively convert objects
  if (typeof value === 'object') {
    const res: { [key: string]: any } = {};
    Object.keys(value).forEach((key) => {
      const currentValue = (value as { [key: string]: any })[key];
      if (!removeUndefinedFields || currentValue !== undefined) {
        res[key] = convertNull(currentValue, removeUndefinedFields);
      }
    });
    return res as any as T;
  }

  return value;
};

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
