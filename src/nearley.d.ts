declare module 'nearley' {
  export interface Token {
    value: any;
    [key: string]: any;
  }

  export interface Lexer {
    formatError: (token: Token) => string;
    has: (tokenType: string) => boolean;
    next: () => Token | undefined;
    reset: (chunk: string, info: any) => void;
    save: () => any;
  }

  export interface NearleyRule {
    name: string;
    postprocess?: (d: any[], loc?: number, reject?: {}) => any;
    symbols: NearleySymbol[];
  }

  export type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

  type Column = object;

  export class Parser<T = any> {
    public results: T[];

    constructor(
      parserRules: NearleyRule[],
      parserStart: string,
      options?: { keepHistory?: boolean, lexer?: Lexer },
    )

    public feed(chunk: string): Parser<T>;
    public restore(column: Column): void;
    public save(): Column;
  }
}
