# Group Products

## Product SKU [/products/{productId}/skus/{skuId}]

+ Parameters
  + productId=`100`
  + skuId=`100`

Returns a `SKU` for a product given the id of the product and sku. Includes availableQuantity. Price, discountedPrice, isAvailable,
imageIds, color, size, and style will contain null values.

*TODO: we shouldn't be sending a partial object like this*

### Get Product SKU [GET]

Returns a `SKU` for a product given the id of the product and sku. Includes availableQuantity.

+ Response 200

      {{example 'product'}}
