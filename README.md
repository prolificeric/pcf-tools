# PCF Tools

## Installation

`sudo npm install -g pcf-tools`

## Assemble Blueprint

`pcf build path/to/specs`

Loads `specs.json` at the root of the folder, which looks like this:

```json
{
  "parent": "../node_modules/parent-spec",
  "features": [
    "products",
    "cart",
    "sessions"
  ]
}
```
