# PCF Tools

Assemble API Blueprint specs with concatenation, templating, and inheritance.

## Installation

`sudo npm install -g pcf-tools`

## `build` command

`pcf build path/to/specs path/to/output.md`

Loads `spec.json` at the root of the folder, which looks like this:

```json
{
  "name": "Prolific Store",
  "inherit": "node_modules/pcf-specs",
  "version": "1.1.0",
  "features": [
    "overview",
    "endpoints/products",
    "endpoints/cart",
    "endpoints/checkout",
    "models/product",
    "models/cartItem"
  ],
  "excludeEndpoints": {
    "/products/{id}/reviews": [
      "POST"
    ],
    "/checkout/gift-cards": true
  }
}
```

A rundown of each option:

`name` - The name of the API.
`inherit` (optional) - Path to specs to inherit from. See "Spec Inheritance" to learn how specs are merged.
`version` - Semantic versioning of the specs (not the API).
`features` - Concatenates each markdown file at the given path within the spec folder (with .md omitted).
`excludeEndpoints` (optional) - A map of endpoint paths to omit. If the value is an array, it will only omit those methods. If it is `true`, it will omit _all_ methods for that endpoint.

### Setting Up The File Structure

First we'll lay out a basic example, then explain the purpose of each directory and file.

```
spec/
  spec.json
  package.json
  Makefile
  overview.md
  node_modules/
  endpoints/
    products.md
  examples/
    product.json
  schemas/
    product.json
  models/
    product.md
  headers/
    session.js
```

#### package.json

If you plan on extending a public base spec, like `pcf-specs`, initiate an npm `package.json` file:

`npm init`

Then install the spec:

`npm install pcf-specs`

This will allow you to lock your spec to a specific version of the parent one using the `package.json` file.

#### overview.md

The introductory part of the spec, including title:

```
# Google Maps API

This is the Google Maps API. Enjoy!
```

#### endpoints/

This holds the markdown files that will be concatenated together. They also allow you to use Handlebars templating, providing several helpers:

```
# Group Products
These are the endpoints regarding products.

## Product [/products/{id}]

### Get Product [GET]
Gets the full product model for the given id.

+ Parameters

  + id (required, string, `12345`) ... The id of the product.

+ Response 200 (application/json; charset=utf-8)

  + Body

            {{example 'product'}}

  + Schema

            {{schema 'product'}}
```

The `example` helper inserts the JSON from `examples/product.json`, while `schema` inserts the JSON from `schemas/product.json`.

#### examples/

Holds example JSON bodies to be returned by endpoints. Here is an example that extends a parent one. Notice you can also use templating within a JSON file as well:

```
{
  "__exclude": ["rating"],
  "reviews": "{{example 'reviewCollection'}}",
  "materials": [
    "cotton",
    "polyester"
  ]
}
```

See `JSON File Features` to learn about `__exclude` and other functions.

#### schemas/

Includes body schemas to be included in endpoint files.

#### models/

Includes markdown files that describe each model. These are typically appended at the end of the blueprint.

```
# Group Product Model

Description of the product model.

{{schema 'product'}}
```

#### Headers

Includes flat JSON files representing names and example values of headers.

```
{
  "sessionId": "a8d8f9ea108382374"
}
```

### JSON File Features

You can manipulate JSON structures using special keys that act as functions.

`"__exclude": ["key1", "key2"]` - Omits specified keys. Used to suppress inherited keys from parent specs. Can be at any level in the JSON object.
`"__include": ["key3", "key4"]` - _Only_ uses specified keys. Can be used anywhere in JSON object. Takes precedence over `__exclude`.
`"__inherits": "examples/shortProduct.json"` - Merges this object into specified object.
`"key": "{{example 'addressCollection'}}"` - Imports specified JSON object.
