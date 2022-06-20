const value = (val, context, options) => {
  const isObject = (val) =>
    Object.prototype.toString.call(val) === '[object Object]';
  const isOptions = (val) => isObject(val) && isObject(val.hash);
  const isBlock = (options) =>
    isOptions(options) &&
    typeof options.fn === 'function' &&
    typeof options.inverse === 'function';

  if (isOptions(val)) {
    return value(null, val, options);
  }
  if (isOptions(context)) {
    return value(val, {}, context);
  }
  if (isBlock(options)) {
    return !!val ? options.fn(context) : options.inverse(context);
  }
  return val;
};

/**
 * Render a block when a comparison of the first and third
 * arguments returns true. The second argument is
 * the [arithemetic operator][operators] to use. You may also
 * optionally specify an inverse block to render when falsy.
 *
 * @param `a`
 * @param `operator` The operator to use. Operators must be enclosed in quotes: `">"`, `"="`, `"<="`, and so on.
 * @param `b`
 * @param {Object} `options` Handlebars provided options object
 * @return {String} Block, or if specified the inverse block is rendered if falsey.
 */
export function compare(a, operator, b, options) {
  if (arguments.length < 4) {
    throw new Error('handlebars Helper {{compare}} expects 4 arguments');
  }

  let result;
  switch (operator) {
    case '==':
      result = a == b;
      break;
    case '===':
      result = a === b;
      break;
    case '!=':
      result = a != b;
      break;
    case '!==':
      result = a !== b;
      break;
    case '<':
      result = a < b;
      break;
    case '>':
      result = a > b;
      break;
    case '<=':
      result = a <= b;
      break;
    case '>=':
      result = a >= b;
      break;
    case 'typeof':
      result = typeof a === b;
      break;
    default: {
      throw new Error(
        'helper {{compare}}: invalid operator: `' + operator + '`',
      );
    }
  }

  return value(result, this, options);
}
