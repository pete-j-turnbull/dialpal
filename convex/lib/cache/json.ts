const NUMBER_INFINITY = "N$Infinity";
const DATE_PREFIX = "D$";
const DATE_REGEX =
  /^\D\$\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/;

export const marshal = function (
  value: any,
  ...additionalStringifyArgs: any[]
) {
  return JSON.stringify(_marshal(value), ...additionalStringifyArgs);
};

export const unmarshal = function (text: string) {
  return JSON.parse(text, (_key, value) => _unmarshal(value));
};

function _marshal(value: any): any {
  if (value instanceof Date) {
    return marshalDate(value);
  } else if (value === Infinity) {
    return NUMBER_INFINITY;
  } else if (Array.isArray(value)) {
    return value.map(_marshal);
  } else if (value === null) {
    return value;
  } else if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [key, _marshal(value)])
    );
  }
  return value;
}

function marshalDate(value: Date): string {
  return `${DATE_PREFIX}${value.toISOString()}`;
}

function _unmarshal(value: any): any {
  const typeofVal = typeof value;
  if (typeofVal === "string") {
    return unmarshalString(value);
  }
  return value;
}

function unmarshalString(value: string): any {
  if (value === NUMBER_INFINITY) {
    return Infinity;
  }
  if (DATE_REGEX.test(value)) {
    return new Date(value.replace(DATE_PREFIX, ""));
  }
  return value;
}
