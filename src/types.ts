//License: Apache 2.0. See LICENSE.md

// -----------------------------------------------------------------------------

export type Headers = Record<string, string | Array<string>>;

export type JSONParser = (text: string, reviver?: (this: any, key: string, value: any) => any) => any;
