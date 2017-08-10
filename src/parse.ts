/**
 * FBP-Type language parser
 * @module fbp-types/parse
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import * as nearley from 'nearley';

import { ParserRules, ParserStart } from './grammar';
import { fragments } from './types';

// Create parser from grammar
const parser = new nearley.Parser<fragments.Any>(ParserRules, ParserStart);
// Save initial state for reuse
const initialParserState = parser.save();

/** Parse a type string */
const parseType = (type: string): fragments.Any => {
  // Parse input & get result
  const result = (parser.feed(type).results[0] as fragments.Any);

  // In testing environment: Check for bad (e.g. ambiguous) grammar
  if (process.env.NODE_ENV === 'test' && parser.results.length !== 1) {
    throw new Error(`Deterministic parse failed: ${JSON.stringify(parser.results)}`);
  }

  // No result -> invalid input
  if (!parser.results.length) throw new Error('Invalid input string');

  // Reset parser
  parser.restore(initialParserState);
  return result;
};

export default parseType;
