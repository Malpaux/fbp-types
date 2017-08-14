/**
 * Type matcher
 * @module fbp-types/match
 * @author Paul Brachmann
 * @license Copyright 2017 Unithing All Rights Reserved.
 */

import check from './check';
import Fragment from './grammar';
import { fragments, GenericsMap } from './types';
import { isNullable } from './utils';

const nullableAny = new Fragment('nullable', new Fragment('primitive', 'any'));

/** Match two types (check for compatibility & if possible, resolve generics) */
const match = (
  receivingType: fragments.Any,
  receivedType: fragments.Any,
  genericsMap?: GenericsMap,
  context: {
    nullable?: boolean,
    readonlyGenerics: boolean,
  } = { readonlyGenerics: true },
): boolean => {
  const { data, type } = receivingType;
  const { data: data2, type: type2 } = receivedType;

  if (type2 === 'nullable') {
    // Propagate nullability of unions/intersections
    if (data2.type === 'union') {
      const { data: subData } = data2;
      return match(receivingType, new Fragment('nullable', subData.type), genericsMap, context)
        && match(receivingType, new Fragment('nullable', subData.type2), genericsMap, context);
    } else if (data2.type === 'intersection') {
      const { data: subData } = data2;
      return match(receivingType, new Fragment('nullable', subData.type), genericsMap, context)
        || match(receivingType, new Fragment('nullable', subData.type2), genericsMap, context);
    }
  } else if (type2 === 'union') {
    // Every type that could occur in a received union has to be accepted
    return match(receivingType, data2.type, genericsMap, context)
      && match(receivingType, data2.type2, genericsMap, context);
  }

  switch (type) {
    case 'primitive':
      // Any type accepts any non-null type
      if (data === 'any'
        && data2 !== null
        && type2 !== 'generic'
        && type2 !== 'named'
        && type2 !== 'nullable'
        && type2 !== 'intersection') return true;
      break;

    case 'generic':
      if (genericsMap) {
        const generic = genericsMap[data.name];
        if (context.readonlyGenerics) {
          // Generic is known and readonly -> check if types match
          if (generic) return match(generic, receivedType, genericsMap, context);
        } else {
          // Check if generic w/ constraints is compatible
          if (data.extends
            && !match(data.extends, receivedType, genericsMap, context)) return false;

          if (generic) {
            // Generic is known and may be reassigned to fit the received type
            if (!match(generic, receivedType, genericsMap, context)) {
              // Extend generic type
              genericsMap[data.name] = new Fragment('union', {
                type: generic,
                type2: receivedType,
              });
            }
          } else {
            // Generic is unknown and may be initialized
            genericsMap[data.name] = receivedType;
          }
          return true;
        }
      }
      // Generic is unknown and readonly -> try to match possible type
      return !data.extends || match(data.extends, receivedType, genericsMap, context);

    case 'nullable':
      // Nullable value accepts non-null value
      return match(data, receivedType, genericsMap, { ...context, nullable: true });

    case 'intersection':
      // All types in a receiving intersection have to be matched
      return match(data.type, receivedType, genericsMap, context)
        && match(data.type2, receivedType, genericsMap, context);

    case 'union':
      // All unions with at least one nullable member is nullable
      const newContext = isNullable(data.type) || isNullable(data.type2) ?
        { ...context, nullable: true }
      : context;

      // Any type in a receiving union will be accepted
      return match(data.type, receivedType, genericsMap, newContext)
        || match(data.type2, receivedType, genericsMap, newContext);
  }

  switch (type2) {
    case 'literal':
      // Check for direct match
      return type === type2 ? data === data2
        : data2 === null && context.nullable
          // Literal type may be accepted if it is of the receiving type
          || check(receivingType, data2, genericsMap);

    case 'primitive':
      return type === type2 && data === data2;

    case 'generic':
      // Received generics are unknown -> check against possible type (if applicable)
      return data2.extends ? match(receivingType, data2.extends, genericsMap, context)
        // Generic w/o constraints may take every type you can think of -> check against '?any' type
      : match(receivingType, nullableAny, genericsMap, context);

    case 'tuple':
      return type === type2
        // Both types are null (or otherwise identical)
        && (data === data2
        // Check if tuple sizes match
        || data && data2 && data.length === data2.length &&
          // Match contained values' types
          !~data.findIndex((valueType: fragments.Any, index: number) => {
            const valueType2 = data2[index];
            return !(valueType2 && match(valueType, valueType2));
          })
        );

    case 'array':
      return type === type2
        // Check if array sizes match
        && data.size === data2.size
        // Check if array types match
        && match(data.type, data2.type, genericsMap);

    case 'list':
      return type === type2
        // Check if list types match
        && match(data, data2, genericsMap);

    case 'struct':
      return type === type2
        // Match contained values' types
        && !~Object.keys(data).findIndex((key) => {
          const pair = data[key];
          const pair2 = data2[key];
          return !(pair2 ?
            (pair.optional || !pair2.optional)
              && match(pair.type, pair2.type, genericsMap, context)
          : pair.optional);
        });

    case 'map':
      return type === type2
        // Check if key types match
        && match(data.keyType, data2.keyType, genericsMap)
        // Check if value types match
        && match(data.type, data2.type, genericsMap);

    case 'named':
      return type === type2 ?
        (
          // Check if names match
          data.name === data2.name
          // Both child types are null (or otherwise identical)
          && (data.type === data2.type
          // Check if child types match
          || data.type && data2.type && match(data.type, data2.type, genericsMap, context))
        )
      : match(receivingType, data2.type, genericsMap, context);

    case 'nullable':
      // Current type tree has to be nullable & types have to match
      return Boolean(context.nullable
        && match(receivingType, data2, genericsMap, context));

    case 'intersection': {
      let newContext = context;

      if (!context.nullable) {
        // A non-nullable intersection must include at least one non-nullable type
        const null1 = isNullable(data2.type);
        const null2 = isNullable(data2.type2);
        if (!(null1 && null2) && (null1 || null2)) newContext = { ...context, nullable: true };
      }

      // If any type in a received intersection is accepted, the whole intersection is
      return match(receivingType, data2.type, genericsMap, newContext)
        || match(receivingType, data2.type2, genericsMap, newContext);
    }
  }

  return false;
};

export default match;
