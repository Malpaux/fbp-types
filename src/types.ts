/**
 * Shared type definitions
 * @module fbp-types/types
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import * as fragments from './grammar';
export { fragments };

export interface CheckerMap {
  [typeName: string]: (value?: any) => boolean;
}

export interface GenericsMap {
  [genericName: string]: fragments.Any;
}
