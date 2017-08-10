@{%
  const unpack = <T>(data: T[]): T => data[0];
%}

# Whitespace
_  -> wschar:* {% () => null %}
__ -> wschar:+ {% () => null %}
wschar -> [ \t\n\v\f] {% id %}

# Null
nullLiteral -> "null" {% () => null %}

# Booleans
boolean ->
  "true" {% () => true %}
| "false" {% () => false %}

# Chars
char -> "'" sstrchar "'" {% (data) => data[1] %}

# Numbers
number -> "-":? [0-9]:+ ("." [0-9]:+):? {% (data) =>
    parseFloat(`${(data[0] || '')}${data[1].join('')}${(data[2] ? '.'+data[2][1].join('') : '')}`)
  %}

unsigned_int -> [0-9]:+ {% (data) => parseInt(data[0].join('')) %}

# Strings
string -> dqstring | sqstring {% unpack %}

# Double-quoted string
dqstring -> "\"" dstrchar:* "\"" {% (data) => data[1].join('') %}
# Single-quoted string
sqstring -> "'"  sstrchar:* "'"  {% (data) => data[1].join('') %}

dstrchar -> [^\\"\n] {% id %}
    | "\\" strescape {% (data) => JSON.parse(`"${data.join('')}"`) %}

sstrchar -> [^\\'\n] {% id %}
    | "\\" strescape {% (data) => JSON.parse(`"${data.join('')}"`) %}
    | "\\'" {% () => '\'' %}

strescape -> ["\\/bfnrt] {% id %}
    | "u" [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] [a-fA-F0-9] {% (data) => data.join('') %}
