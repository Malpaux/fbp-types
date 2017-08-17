/**
 * Type printer
 * @module fbp-types/print
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import { fragments } from './types';

/** Stringify a type AST and wrap it in parentheses (if necessary)  */
export const ensureParentheses = (typeAST: fragments.Any) => {
  const { type } = typeAST;

  return type === 'union' || type === 'intersection' || type === 'nullable' ?
    `(${print(typeAST)})`
  : print(typeAST);
};

/** Stringify a type AST */
const print = ({ type, data }: fragments.Any): string => {
  switch (type) {
    case 'literal':
      return JSON.stringify(data);

    case 'primitive':
      return data;

    case 'generic': {
      const { extends: extendsType } = (data as fragments.Generic['data']);
      return `${data.name}${extendsType ? ` extends ${ensureParentheses(extendsType)}` : ''}`;
    }

    case 'tuple':
      return data ? `[${(data as fragments.Any[]).map(print).join(', ')}]` : '[]';

    case 'array':
      return `${ensureParentheses(data.type)}[${data.size}]`;

    case 'list':
      return `${ensureParentheses(data)}[]`;

    case 'struct':
      return data ? `{ ${Object.keys(data).map((key) =>
        `${key}${data[key].optional ? '?' : ''}: ${print(data[key].type)}`,
      ).join(', ')} }` : '{}';

    case 'map':
      return `{ [${print(data.keyType)}]: ${print(data.type)} }`;

    case 'named':
      return `${data.name}{${data.type ? print(data.type) : ''}}`;

    case 'nullable':
      return `?${ensureParentheses(data)}`;

    case 'intersection':
      return `${print(data.type)} & ${print(data.type2)}`;

    case 'union':
      return `${print(data.type)} | ${print(data.type2)}`;
  }

  return '?any';
};

export default print;
