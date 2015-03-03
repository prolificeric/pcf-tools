# e-Commerce API Specifications
This document contains some requirements for an e-Commerce API.

## Date Formating

The formats are as follows. Exactly the components shown here must be present, with exactly this punctuation. Note that the "T" appears literally in the string, to indicate the beginning of the time element, as specified in [ISO 8601](http://www.w3.org/TR/NOTE-datetime)

* Year:
    * YYYY (eg 1997)

* Year and month:
    * YYYY-MM (eg 1997-07)

* Complete date:
    * YYYY-MM-DD (eg 1997-07-16)

* Complete date plus hours and minutes:
    * YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)

* Complete date plus hours, minutes and seconds:
    * YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)

* Complete date plus hours, minutes, seconds and a decimal fraction of a second
    * YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)


Examples:

* 1994-11-05T08:15:30-05:00 corresponds to November 5, 1994, 8:15:30 am, US Eastern Standard Time.

* 1994-11-05T13:15:30Z corresponds to the same instant.

* 1991-07-05 is a date with no time is useful for describing a birthday, anniversary, holiday, etc. 
 

This keeps the date consistent across all time zones. The examples above could lead to different dates depending on the timezone.

## Headers

`TODO`
What's in the headers (api keys, caching data, etc.)

## Pagination

All paging should follow [Prolific's simplified paging specification](https://bitbucket.org/prolificinteractive/engineering-standards/wiki/Prolific_Approach_to_Paging) unless otherwise specified.


## Caching

Resources that can be cached will be cached using the following headers in their response.

```
Cache-Control: private, max-age=300000 //private is used for user specific data, public is used for generic
Expires: Fri, 30 Oct 1998 14:19:41 GMT //should match the time in max age
```

Resources that cannot be cached will use the following headers in their response.

```
Cache-Control: no-cache, no-store, must-revalidate
Expires: 0
```

## Security

`TODO`
Explain strategy on SSL pinning or other strategies to protect traffic from MITM

## Authentication

`TODO`
Preferred method to handle authentication.

# Group Cart
This handles all of the cart related endpoints.  Including the checkout process, and cart
finalization.

`TODO` Endpoint should be updated to allow sending an addressID / cardID

`TODO` add separate spec files for CheckoutUserInformation?

`TODO` add cart/acceptedpaymenttypes endpoint, that will result in a list of accepted cards type, but also stuff like paypal or amazon, so that UI can adapt accordingly


## Cart [/cart]
These endpoints handle viewing and editing the user's cart.

### Add To Cart [POST]
Add item to the current user's cart.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            {
              "cartItems": [
                {
                  "product": {
                    "id": "123"
                  },
                  "quantity": 5,
                  "sku": {
                    "id": "12345"
                  },
                  "personalizations": [
                    {
                      "id": "1234",
                      "label": "Bride's Name",
                      "selectedValue": "Martha Stewart"
                    }
                  ]
                }
              ]
            }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "itemCount": 1,
              "itemTotalCount": 5,
              "subTotal": 299.99,
              "tax": 9.88,
              "totalAdjustment": -100,
              "total": 199.99,
              "cartItems": [
                {
                  "id": "123456",
                  "product": {
                    "id": "1234",
                    "name": "Vera",
                    "price": 45,
                    "discountedPrice": 40,
                    "description": "<p>Gorgeous lace ...",
                    "imageResources": {
                      "1": [
                        {
                          "url": "http://www.url1.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url2.jpg",
                          "usage": "small"
                        },
                        {
                          "url": "http://www.url3.jpg",
                          "usage": "large"
                        }
                      ],
                      "2": [
                        {
                          "url": "http://www.url4.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url6.jpg",
                          "usage": "large"
                        }
                      ]
                    },
                    "imageIds": [
                      "1",
                      "2"
                    ],
                    "categoryIds": [
                      "1",
                      "2",
                      "5"
                    ],
                    "wishlistIds": [
                      "1",
                      "2",
                      "5"
                    ]
                  },
                  "quantity": 5,
                  "sku": {
                    "id": "12345",
                    "isAvailable": true,
                    "availableQuantity": 4,
                    "price": 45,
                    "discountedPrice": 40,
                    "imageIds": [
                      "7",
                      "8"
                    ]
                  },
                  "personalizations": [
                    {
                      "id": "1",
                      "label": "Thread Color",
                      "type": "string",
                      "options": [
                        "Apple",
                        "Wisteria"
                      ],
                      "instructionsUrl": "http://www.url.com",
                      "selectedValue": null
                    }
                  ],
                  "otherSkusAvailable": true,
                  "adjustments": [
                    {
                      "type": "coupon",
                      "amount": -9.99,
                      "code": "SOME_CODE",
                      "description": "Save 20% on Furniture"
                    }
                  ],
                  "totalPrice": 1999.95,
                  "totalDiscountedPrice": 1499.95
                }
              ],
              "costUntilFreeShipping": 45,
              "adjustments": [
                {
                  "type": "coupon",
                  "amount": -9.99,
                  "code": "SOME_CODE",
                  "description": "Save 20% on Furniture"
                }
              ]
            }

    + Schema

            {
              "title": "Cart",
              "type": [
                "object",
                "null"
              ],
              "description": "The full cart, detailing all information known about an cart.",
              "required": true,
              "properties": {
                "itemCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Number of different cart items, regardless of the quantity for each item. Should be calculated server side in case the response is paginated."
                },
                "itemTotalCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Total number of items in the cart. Represents the sum of the quantities for each cart item. Should be calculated server side in case the response is paginated."
                },
                "tax": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Tax on the cart."
                },
                "subTotal": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost prior to applying adjustments."
                },
                "totalAdjustment": {
                  "type": "number",
                  "required": true,
                  "description": "Total amount removed from the original total."
                },
                "total": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost of the cart."
                },
                "costUntilFreeShipping": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Amount of money a customer must still spend to get free shipping."
                },
                "cartItems": {
                  "type": "array",
                  "required": true,
                  "minItems": 1,
                  "items": {
              "title": "CartItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an item that has been added to the cart.  Also used in order for orderItems.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of cart Item. Backend generated."
                },
                "product": {
                  "title": "ShortProduct",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Describes a shorten version of a product.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Identifier of product."
                    },
                    "name": {
                      "type": "string",
                      "required": true,
                      "description": "Name of product."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Full price of the product."
                    },
                    "discountedPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Sale price of the product."
                    },
                    "description": {
                      "type": "number",
                      "required": true,
                      "description": "Product`s description. Potentially contains HTML tags."
                    },
                    "imageResources": {
                      "type": "object",
                      "patternProperties": {
                        ".*": {
                          "type": "array",
                          "items": {{schema 'image' true}},
                          "required": true,
                          "minItems": 0
                        }
                      },
                      "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                    },
                    "categoryIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of category ids."
                    },
                    "wishlistIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of wishlist ids."
                    }
                  }
                },
                "quantity": {
                  "type": "integer",
                  "required": true,
                  "description": "The amount of that exact item (same sku, same personalizations) in the cart."
                },
                "sku": {
                  "title": "Sku",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Values of the selected SKU.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Unique identifier for the SKU."
                    },
                    "isAvailable": {
                      "type": "boolean",
                      "required": true,
                      "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                    },
                    "availableQuantity": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "required": true,
                      "description": "Number of items available for this SKU."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                    },
                    "discountPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Discounted price of the SKU, overrides product `discountedPrice."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                    }
                  }
                },
                "personalizations": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "description": "An array of personalization selections."
                },
                "otherSkusAvailable": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Denotes if there are other skus of this product available."
                },
                "adjustments": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "Adjustment",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
                    "required": true,
                    "properties": {
                      "type": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                      },
                      "amount": {
                        "type": "number",
                        "required": true,
                        "description": "The amount to be discounted. This value is for display purposes only."
                      },
                      "code": {
                        "type": "string",
                        "required": true,
                        "description": "The coupon code number."
                      },
                      "description": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The coupon description."
                      }
                    }
                  },
                  "description": "An array of *item specific* adjustments."
                },
                "totalPrice": {
                  "type": "number",
                  "required": true,
                  "description": "Product price times quantity."
                },
                "totalDiscountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Product discounted price times quantity. Does not take adjustments into account."
                }
              }
            },
                  "description": "An array of items part of the cart."
                },
                "adjustments": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
              "title": "Adjustment",
              "type": [
                "object",
                "null"
              ],
              "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
              "required": true,
              "properties": {
                "type": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                },
                "amount": {
                  "type": "number",
                  "required": true,
                  "description": "The amount to be discounted. This value is for display purposes only."
                },
                "code": {
                  "type": "string",
                  "required": true,
                  "description": "The coupon code number."
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The coupon description."
                }
              }
            },
                  "description": "An array of adjustments applied to the cart."
                }
              }
            }

### Get Cart [GET]
Returns the cart for the current user.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "itemCount": 1,
              "itemTotalCount": 5,
              "subTotal": 299.99,
              "tax": 9.88,
              "totalAdjustment": -100,
              "total": 199.99,
              "cartItems": [
                {
                  "id": "123456",
                  "product": {
                    "id": "1234",
                    "name": "Vera",
                    "price": 45,
                    "discountedPrice": 40,
                    "description": "<p>Gorgeous lace ...",
                    "imageResources": {
                      "1": [
                        {
                          "url": "http://www.url1.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url2.jpg",
                          "usage": "small"
                        },
                        {
                          "url": "http://www.url3.jpg",
                          "usage": "large"
                        }
                      ],
                      "2": [
                        {
                          "url": "http://www.url4.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url6.jpg",
                          "usage": "large"
                        }
                      ]
                    },
                    "imageIds": [
                      "1",
                      "2"
                    ],
                    "categoryIds": [
                      "1",
                      "2",
                      "5"
                    ],
                    "wishlistIds": [
                      "1",
                      "2",
                      "5"
                    ]
                  },
                  "quantity": 5,
                  "sku": {
                    "id": "12345",
                    "isAvailable": true,
                    "availableQuantity": 4,
                    "price": 45,
                    "discountedPrice": 40,
                    "imageIds": [
                      "7",
                      "8"
                    ]
                  },
                  "personalizations": [
                    {
                      "id": "1",
                      "label": "Thread Color",
                      "type": "string",
                      "options": [
                        "Apple",
                        "Wisteria"
                      ],
                      "instructionsUrl": "http://www.url.com",
                      "selectedValue": null
                    }
                  ],
                  "otherSkusAvailable": true,
                  "adjustments": [
                    {
                      "type": "coupon",
                      "amount": -9.99,
                      "code": "SOME_CODE",
                      "description": "Save 20% on Furniture"
                    }
                  ],
                  "totalPrice": 1999.95,
                  "totalDiscountedPrice": 1499.95
                }
              ],
              "costUntilFreeShipping": 45,
              "adjustments": [
                {
                  "type": "coupon",
                  "amount": -9.99,
                  "code": "SOME_CODE",
                  "description": "Save 20% on Furniture"
                }
              ]
            }

    + Schema

            {
              "title": "Cart",
              "type": [
                "object",
                "null"
              ],
              "description": "The full cart, detailing all information known about an cart.",
              "required": true,
              "properties": {
                "itemCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Number of different cart items, regardless of the quantity for each item. Should be calculated server side in case the response is paginated."
                },
                "itemTotalCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Total number of items in the cart. Represents the sum of the quantities for each cart item. Should be calculated server side in case the response is paginated."
                },
                "tax": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Tax on the cart."
                },
                "subTotal": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost prior to applying adjustments."
                },
                "totalAdjustment": {
                  "type": "number",
                  "required": true,
                  "description": "Total amount removed from the original total."
                },
                "total": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost of the cart."
                },
                "costUntilFreeShipping": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Amount of money a customer must still spend to get free shipping."
                },
                "cartItems": {
                  "type": "array",
                  "required": true,
                  "minItems": 1,
                  "items": {
              "title": "CartItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an item that has been added to the cart.  Also used in order for orderItems.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of cart Item. Backend generated."
                },
                "product": {
                  "title": "ShortProduct",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Describes a shorten version of a product.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Identifier of product."
                    },
                    "name": {
                      "type": "string",
                      "required": true,
                      "description": "Name of product."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Full price of the product."
                    },
                    "discountedPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Sale price of the product."
                    },
                    "description": {
                      "type": "number",
                      "required": true,
                      "description": "Product`s description. Potentially contains HTML tags."
                    },
                    "imageResources": {
                      "type": "object",
                      "patternProperties": {
                        ".*": {
                          "type": "array",
                          "items": {{schema 'image' true}},
                          "required": true,
                          "minItems": 0
                        }
                      },
                      "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                    },
                    "categoryIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of category ids."
                    },
                    "wishlistIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of wishlist ids."
                    }
                  }
                },
                "quantity": {
                  "type": "integer",
                  "required": true,
                  "description": "The amount of that exact item (same sku, same personalizations) in the cart."
                },
                "sku": {
                  "title": "Sku",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Values of the selected SKU.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Unique identifier for the SKU."
                    },
                    "isAvailable": {
                      "type": "boolean",
                      "required": true,
                      "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                    },
                    "availableQuantity": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "required": true,
                      "description": "Number of items available for this SKU."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                    },
                    "discountPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Discounted price of the SKU, overrides product `discountedPrice."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                    }
                  }
                },
                "personalizations": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "description": "An array of personalization selections."
                },
                "otherSkusAvailable": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Denotes if there are other skus of this product available."
                },
                "adjustments": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "Adjustment",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
                    "required": true,
                    "properties": {
                      "type": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                      },
                      "amount": {
                        "type": "number",
                        "required": true,
                        "description": "The amount to be discounted. This value is for display purposes only."
                      },
                      "code": {
                        "type": "string",
                        "required": true,
                        "description": "The coupon code number."
                      },
                      "description": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The coupon description."
                      }
                    }
                  },
                  "description": "An array of *item specific* adjustments."
                },
                "totalPrice": {
                  "type": "number",
                  "required": true,
                  "description": "Product price times quantity."
                },
                "totalDiscountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Product discounted price times quantity. Does not take adjustments into account."
                }
              }
            },
                  "description": "An array of items part of the cart."
                },
                "adjustments": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
              "title": "Adjustment",
              "type": [
                "object",
                "null"
              ],
              "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
              "required": true,
              "properties": {
                "type": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                },
                "amount": {
                  "type": "number",
                  "required": true,
                  "description": "The amount to be discounted. This value is for display purposes only."
                },
                "code": {
                  "type": "string",
                  "required": true,
                  "description": "The coupon code number."
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The coupon description."
                }
              }
            },
                  "description": "An array of adjustments applied to the cart."
                }
              }
            }

### Update Cart [PUT]
Updates an order item in a cart. Notes:

* The order item quantity is the `only modifiable field`

* If 0 is passed in, the item will be removed from the cart and consequently will not be returned. 

* New items also **cannot** be added to the cart. They will be ignored. POST must be used so that an id may be assigned.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            {
              "cartItems": [
                {
                  "id": "CARTITEMID1",
                  "quantity": 3
                }
              ]
            }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "itemCount": 1,
              "itemTotalCount": 5,
              "subTotal": 299.99,
              "tax": 9.88,
              "totalAdjustment": -100,
              "total": 199.99,
              "cartItems": [
                {
                  "id": "123456",
                  "product": {
                    "id": "1234",
                    "name": "Vera",
                    "price": 45,
                    "discountedPrice": 40,
                    "description": "<p>Gorgeous lace ...",
                    "imageResources": {
                      "1": [
                        {
                          "url": "http://www.url1.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url2.jpg",
                          "usage": "small"
                        },
                        {
                          "url": "http://www.url3.jpg",
                          "usage": "large"
                        }
                      ],
                      "2": [
                        {
                          "url": "http://www.url4.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url6.jpg",
                          "usage": "large"
                        }
                      ]
                    },
                    "imageIds": [
                      "1",
                      "2"
                    ],
                    "categoryIds": [
                      "1",
                      "2",
                      "5"
                    ],
                    "wishlistIds": [
                      "1",
                      "2",
                      "5"
                    ]
                  },
                  "quantity": 5,
                  "sku": {
                    "id": "12345",
                    "isAvailable": true,
                    "availableQuantity": 4,
                    "price": 45,
                    "discountedPrice": 40,
                    "imageIds": [
                      "7",
                      "8"
                    ]
                  },
                  "personalizations": [
                    {
                      "id": "1",
                      "label": "Thread Color",
                      "type": "string",
                      "options": [
                        "Apple",
                        "Wisteria"
                      ],
                      "instructionsUrl": "http://www.url.com",
                      "selectedValue": null
                    }
                  ],
                  "otherSkusAvailable": true,
                  "adjustments": [
                    {
                      "type": "coupon",
                      "amount": -9.99,
                      "code": "SOME_CODE",
                      "description": "Save 20% on Furniture"
                    }
                  ],
                  "totalPrice": 1999.95,
                  "totalDiscountedPrice": 1499.95
                }
              ],
              "costUntilFreeShipping": 45,
              "adjustments": [
                {
                  "type": "coupon",
                  "amount": -9.99,
                  "code": "SOME_CODE",
                  "description": "Save 20% on Furniture"
                }
              ]
            }

    + Schema

            {
              "title": "Cart",
              "type": [
                "object",
                "null"
              ],
              "description": "The full cart, detailing all information known about an cart.",
              "required": true,
              "properties": {
                "itemCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Number of different cart items, regardless of the quantity for each item. Should be calculated server side in case the response is paginated."
                },
                "itemTotalCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Total number of items in the cart. Represents the sum of the quantities for each cart item. Should be calculated server side in case the response is paginated."
                },
                "tax": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Tax on the cart."
                },
                "subTotal": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost prior to applying adjustments."
                },
                "totalAdjustment": {
                  "type": "number",
                  "required": true,
                  "description": "Total amount removed from the original total."
                },
                "total": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost of the cart."
                },
                "costUntilFreeShipping": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Amount of money a customer must still spend to get free shipping."
                },
                "cartItems": {
                  "type": "array",
                  "required": true,
                  "minItems": 1,
                  "items": {
              "title": "CartItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an item that has been added to the cart.  Also used in order for orderItems.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of cart Item. Backend generated."
                },
                "product": {
                  "title": "ShortProduct",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Describes a shorten version of a product.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Identifier of product."
                    },
                    "name": {
                      "type": "string",
                      "required": true,
                      "description": "Name of product."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Full price of the product."
                    },
                    "discountedPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Sale price of the product."
                    },
                    "description": {
                      "type": "number",
                      "required": true,
                      "description": "Product`s description. Potentially contains HTML tags."
                    },
                    "imageResources": {
                      "type": "object",
                      "patternProperties": {
                        ".*": {
                          "type": "array",
                          "items": {{schema 'image' true}},
                          "required": true,
                          "minItems": 0
                        }
                      },
                      "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                    },
                    "categoryIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of category ids."
                    },
                    "wishlistIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of wishlist ids."
                    }
                  }
                },
                "quantity": {
                  "type": "integer",
                  "required": true,
                  "description": "The amount of that exact item (same sku, same personalizations) in the cart."
                },
                "sku": {
                  "title": "Sku",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Values of the selected SKU.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Unique identifier for the SKU."
                    },
                    "isAvailable": {
                      "type": "boolean",
                      "required": true,
                      "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                    },
                    "availableQuantity": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "required": true,
                      "description": "Number of items available for this SKU."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                    },
                    "discountPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Discounted price of the SKU, overrides product `discountedPrice."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                    }
                  }
                },
                "personalizations": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "description": "An array of personalization selections."
                },
                "otherSkusAvailable": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Denotes if there are other skus of this product available."
                },
                "adjustments": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "Adjustment",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
                    "required": true,
                    "properties": {
                      "type": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                      },
                      "amount": {
                        "type": "number",
                        "required": true,
                        "description": "The amount to be discounted. This value is for display purposes only."
                      },
                      "code": {
                        "type": "string",
                        "required": true,
                        "description": "The coupon code number."
                      },
                      "description": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The coupon description."
                      }
                    }
                  },
                  "description": "An array of *item specific* adjustments."
                },
                "totalPrice": {
                  "type": "number",
                  "required": true,
                  "description": "Product price times quantity."
                },
                "totalDiscountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Product discounted price times quantity. Does not take adjustments into account."
                }
              }
            },
                  "description": "An array of items part of the cart."
                },
                "adjustments": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
              "title": "Adjustment",
              "type": [
                "object",
                "null"
              ],
              "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
              "required": true,
              "properties": {
                "type": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                },
                "amount": {
                  "type": "number",
                  "required": true,
                  "description": "The amount to be discounted. This value is for display purposes only."
                },
                "code": {
                  "type": "string",
                  "required": true,
                  "description": "The coupon code number."
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The coupon description."
                }
              }
            },
                  "description": "An array of adjustments applied to the cart."
                }
              }
            }

## Cart Adjustment [/cart/adjustment]
### Add Adjustment To Cart [POST]
Used for redeeming Gift Cards / Promocode and Coupons. Notes:

* As a result cart gets updated. 

* Options are cash on account, % or $ off order/item, $ off shipping

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            {
              "type": "coupon",
              "code": "SOME_CODE"
            }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "itemCount": 1,
              "itemTotalCount": 5,
              "subTotal": 299.99,
              "tax": 9.88,
              "totalAdjustment": -100,
              "total": 199.99,
              "cartItems": [
                {
                  "id": "123456",
                  "product": {
                    "id": "1234",
                    "name": "Vera",
                    "price": 45,
                    "discountedPrice": 40,
                    "description": "<p>Gorgeous lace ...",
                    "imageResources": {
                      "1": [
                        {
                          "url": "http://www.url1.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url2.jpg",
                          "usage": "small"
                        },
                        {
                          "url": "http://www.url3.jpg",
                          "usage": "large"
                        }
                      ],
                      "2": [
                        {
                          "url": "http://www.url4.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url6.jpg",
                          "usage": "large"
                        }
                      ]
                    },
                    "imageIds": [
                      "1",
                      "2"
                    ],
                    "categoryIds": [
                      "1",
                      "2",
                      "5"
                    ],
                    "wishlistIds": [
                      "1",
                      "2",
                      "5"
                    ]
                  },
                  "quantity": 5,
                  "sku": {
                    "id": "12345",
                    "isAvailable": true,
                    "availableQuantity": 4,
                    "price": 45,
                    "discountedPrice": 40,
                    "imageIds": [
                      "7",
                      "8"
                    ]
                  },
                  "personalizations": [
                    {
                      "id": "1",
                      "label": "Thread Color",
                      "type": "string",
                      "options": [
                        "Apple",
                        "Wisteria"
                      ],
                      "instructionsUrl": "http://www.url.com",
                      "selectedValue": null
                    }
                  ],
                  "otherSkusAvailable": true,
                  "adjustments": [
                    {
                      "type": "coupon",
                      "amount": -9.99,
                      "code": "SOME_CODE",
                      "description": "Save 20% on Furniture"
                    }
                  ],
                  "totalPrice": 1999.95,
                  "totalDiscountedPrice": 1499.95
                }
              ],
              "costUntilFreeShipping": 45,
              "adjustments": [
                {
                  "type": "coupon",
                  "amount": -9.99,
                  "code": "SOME_CODE",
                  "description": "Save 20% on Furniture"
                }
              ]
            }

    + Schema

            {
              "title": "Cart",
              "type": [
                "object",
                "null"
              ],
              "description": "The full cart, detailing all information known about an cart.",
              "required": true,
              "properties": {
                "itemCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Number of different cart items, regardless of the quantity for each item. Should be calculated server side in case the response is paginated."
                },
                "itemTotalCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Total number of items in the cart. Represents the sum of the quantities for each cart item. Should be calculated server side in case the response is paginated."
                },
                "tax": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Tax on the cart."
                },
                "subTotal": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost prior to applying adjustments."
                },
                "totalAdjustment": {
                  "type": "number",
                  "required": true,
                  "description": "Total amount removed from the original total."
                },
                "total": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost of the cart."
                },
                "costUntilFreeShipping": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Amount of money a customer must still spend to get free shipping."
                },
                "cartItems": {
                  "type": "array",
                  "required": true,
                  "minItems": 1,
                  "items": {
              "title": "CartItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an item that has been added to the cart.  Also used in order for orderItems.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of cart Item. Backend generated."
                },
                "product": {
                  "title": "ShortProduct",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Describes a shorten version of a product.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Identifier of product."
                    },
                    "name": {
                      "type": "string",
                      "required": true,
                      "description": "Name of product."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Full price of the product."
                    },
                    "discountedPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Sale price of the product."
                    },
                    "description": {
                      "type": "number",
                      "required": true,
                      "description": "Product`s description. Potentially contains HTML tags."
                    },
                    "imageResources": {
                      "type": "object",
                      "patternProperties": {
                        ".*": {
                          "type": "array",
                          "items": {{schema 'image' true}},
                          "required": true,
                          "minItems": 0
                        }
                      },
                      "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                    },
                    "categoryIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of category ids."
                    },
                    "wishlistIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of wishlist ids."
                    }
                  }
                },
                "quantity": {
                  "type": "integer",
                  "required": true,
                  "description": "The amount of that exact item (same sku, same personalizations) in the cart."
                },
                "sku": {
                  "title": "Sku",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Values of the selected SKU.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Unique identifier for the SKU."
                    },
                    "isAvailable": {
                      "type": "boolean",
                      "required": true,
                      "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                    },
                    "availableQuantity": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "required": true,
                      "description": "Number of items available for this SKU."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                    },
                    "discountPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Discounted price of the SKU, overrides product `discountedPrice."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                    }
                  }
                },
                "personalizations": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "description": "An array of personalization selections."
                },
                "otherSkusAvailable": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Denotes if there are other skus of this product available."
                },
                "adjustments": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "Adjustment",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
                    "required": true,
                    "properties": {
                      "type": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                      },
                      "amount": {
                        "type": "number",
                        "required": true,
                        "description": "The amount to be discounted. This value is for display purposes only."
                      },
                      "code": {
                        "type": "string",
                        "required": true,
                        "description": "The coupon code number."
                      },
                      "description": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The coupon description."
                      }
                    }
                  },
                  "description": "An array of *item specific* adjustments."
                },
                "totalPrice": {
                  "type": "number",
                  "required": true,
                  "description": "Product price times quantity."
                },
                "totalDiscountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Product discounted price times quantity. Does not take adjustments into account."
                }
              }
            },
                  "description": "An array of items part of the cart."
                },
                "adjustments": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
              "title": "Adjustment",
              "type": [
                "object",
                "null"
              ],
              "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
              "required": true,
              "properties": {
                "type": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                },
                "amount": {
                  "type": "number",
                  "required": true,
                  "description": "The amount to be discounted. This value is for display purposes only."
                },
                "code": {
                  "type": "string",
                  "required": true,
                  "description": "The coupon code number."
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The coupon description."
                }
              }
            },
                  "description": "An array of adjustments applied to the cart."
                }
              }
            }

## Shipping Options [/cart/shippingoptions]
### Get Shipping Options [GET]
* Get shipping options for the current cart, including prices

* Note: shipping options usually cannot be calculated with out address information, which is not present during the cart most of the time. So they shouldn't be part of the cart object directly

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

+ Response 200 (application/json; charset=utf-8)
    + Body

            [
              {
                "id": "1",
                "name": "standard (4-5 days)",
                "price": 0
              }
            ]

    + Schema

            {
              "title": "ShippingOptionCollection",
              "type": [
                "object",
                "null"
              ],
              "required": true,
              "minItems": 0,
              "description": "An array of shipping options.",
              "items": {
                "title": "ShippingOption",
                "type": [
                  "object",
                  "null"
                ],
                "description": "Describes an option for shipping an order.",
                "required": true,
                "properties": {
                  "id": {
                    "type": "string",
                    "required": true,
                    "description": "Id of the shipping option."
                  },
                  "name": {
                    "type": "string",
                    "required": true,
                    "description": "Name for that option."
                  },
                  "price": {
                    "type": "number",
                    "required": true,
                    "description": "Price for that option."
                  }
                }
              }
            }

## Finalize Cart [/cart/finalize]
### Finalize Cart [POST]
Finalize the cart for the current user. Allows the user to review their potential order
with all additional costs present before making a final payment.

* userInformation: User basic info, needed if the user is not logged in

* shippingOption: User chosen shipping option 

* shippingAddress: address where the order should be shipped

* billingAddressSameAsShipping: Specifiers whether the bill should be addressed to the same address as `shippingAddress`

* paymentMethod: Payment method to use. If `billingAddressSameAsShipping` is false, the billing address can be found in that object

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            {
              "userInformation": {
                "firstName": "",
                "lastName": "",
                "email": ""
              },
              "shippingOption": {
                "id": "1",
                "name": "standard (4-5 days)",
                "price": 0
              },
              "shippingAddress": {
                "id": "1234",
                "firstName": "James",
                "lastName": "Bond",
                "address1": "10001 Johnson St",
                "address2": null,
                "city": "Novato",
                "state": "CA",
                "country": "US",
                "zip": "94949",
                "phone": "4151515555",
                "save": true,
                "isPrimary": false
              },
              "billingAddressSameAsShipping": false,
              "paymentMethod": {
                "type": "card",
                "paymentObject": {
                  "cardNumber": "4111111111111111",
                  "cvv": "123",
                  "nameOnCard": "John Snow",
                  "expirationDate": "2017-09",
                  "billingAddress": {
                    "id": "1234",
                    "firstName": "James",
                    "lastName": "Bond",
                    "address1": "10001 Johnson St",
                    "address2": null,
                    "city": "Novato",
                    "state": "CA",
                    "country": "US",
                    "zip": "94949",
                    "phone": "4151515555",
                    "save": true,
                    "isPrimary": false
                  }
                }
              }
            }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "itemCount": 1,
              "itemTotalCount": 5,
              "subTotal": 299.99,
              "tax": 9.88,
              "totalAdjustment": -100,
              "total": 199.99,
              "cartItems": [
                {
                  "id": "123456",
                  "product": {
                    "id": "1234",
                    "name": "Vera",
                    "price": 45,
                    "discountedPrice": 40,
                    "description": "<p>Gorgeous lace ...",
                    "imageResources": {
                      "1": [
                        {
                          "url": "http://www.url1.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url2.jpg",
                          "usage": "small"
                        },
                        {
                          "url": "http://www.url3.jpg",
                          "usage": "large"
                        }
                      ],
                      "2": [
                        {
                          "url": "http://www.url4.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url6.jpg",
                          "usage": "large"
                        }
                      ]
                    },
                    "imageIds": [
                      "1",
                      "2"
                    ],
                    "categoryIds": [
                      "1",
                      "2",
                      "5"
                    ],
                    "wishlistIds": [
                      "1",
                      "2",
                      "5"
                    ]
                  },
                  "quantity": 5,
                  "sku": {
                    "id": "12345",
                    "isAvailable": true,
                    "availableQuantity": 4,
                    "price": 45,
                    "discountedPrice": 40,
                    "imageIds": [
                      "7",
                      "8"
                    ]
                  },
                  "personalizations": [
                    {
                      "id": "1",
                      "label": "Thread Color",
                      "type": "string",
                      "options": [
                        "Apple",
                        "Wisteria"
                      ],
                      "instructionsUrl": "http://www.url.com",
                      "selectedValue": null
                    }
                  ],
                  "otherSkusAvailable": true,
                  "adjustments": [
                    {
                      "type": "coupon",
                      "amount": -9.99,
                      "code": "SOME_CODE",
                      "description": "Save 20% on Furniture"
                    }
                  ],
                  "totalPrice": 1999.95,
                  "totalDiscountedPrice": 1499.95
                }
              ],
              "costUntilFreeShipping": 45,
              "adjustments": [
                {
                  "type": "coupon",
                  "amount": -9.99,
                  "code": "SOME_CODE",
                  "description": "Save 20% on Furniture"
                }
              ]
            }

    + Schema

            {
              "title": "Cart",
              "type": [
                "object",
                "null"
              ],
              "description": "The full cart, detailing all information known about an cart.",
              "required": true,
              "properties": {
                "itemCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Number of different cart items, regardless of the quantity for each item. Should be calculated server side in case the response is paginated."
                },
                "itemTotalCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Total number of items in the cart. Represents the sum of the quantities for each cart item. Should be calculated server side in case the response is paginated."
                },
                "tax": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Tax on the cart."
                },
                "subTotal": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost prior to applying adjustments."
                },
                "totalAdjustment": {
                  "type": "number",
                  "required": true,
                  "description": "Total amount removed from the original total."
                },
                "total": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost of the cart."
                },
                "costUntilFreeShipping": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Amount of money a customer must still spend to get free shipping."
                },
                "cartItems": {
                  "type": "array",
                  "required": true,
                  "minItems": 1,
                  "items": {
              "title": "CartItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an item that has been added to the cart.  Also used in order for orderItems.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of cart Item. Backend generated."
                },
                "product": {
                  "title": "ShortProduct",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Describes a shorten version of a product.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Identifier of product."
                    },
                    "name": {
                      "type": "string",
                      "required": true,
                      "description": "Name of product."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Full price of the product."
                    },
                    "discountedPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Sale price of the product."
                    },
                    "description": {
                      "type": "number",
                      "required": true,
                      "description": "Product`s description. Potentially contains HTML tags."
                    },
                    "imageResources": {
                      "type": "object",
                      "patternProperties": {
                        ".*": {
                          "type": "array",
                          "items": {{schema 'image' true}},
                          "required": true,
                          "minItems": 0
                        }
                      },
                      "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                    },
                    "categoryIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of category ids."
                    },
                    "wishlistIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of wishlist ids."
                    }
                  }
                },
                "quantity": {
                  "type": "integer",
                  "required": true,
                  "description": "The amount of that exact item (same sku, same personalizations) in the cart."
                },
                "sku": {
                  "title": "Sku",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Values of the selected SKU.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Unique identifier for the SKU."
                    },
                    "isAvailable": {
                      "type": "boolean",
                      "required": true,
                      "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                    },
                    "availableQuantity": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "required": true,
                      "description": "Number of items available for this SKU."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                    },
                    "discountPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Discounted price of the SKU, overrides product `discountedPrice."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                    }
                  }
                },
                "personalizations": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "description": "An array of personalization selections."
                },
                "otherSkusAvailable": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Denotes if there are other skus of this product available."
                },
                "adjustments": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "Adjustment",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
                    "required": true,
                    "properties": {
                      "type": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                      },
                      "amount": {
                        "type": "number",
                        "required": true,
                        "description": "The amount to be discounted. This value is for display purposes only."
                      },
                      "code": {
                        "type": "string",
                        "required": true,
                        "description": "The coupon code number."
                      },
                      "description": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The coupon description."
                      }
                    }
                  },
                  "description": "An array of *item specific* adjustments."
                },
                "totalPrice": {
                  "type": "number",
                  "required": true,
                  "description": "Product price times quantity."
                },
                "totalDiscountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Product discounted price times quantity. Does not take adjustments into account."
                }
              }
            },
                  "description": "An array of items part of the cart."
                },
                "adjustments": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
              "title": "Adjustment",
              "type": [
                "object",
                "null"
              ],
              "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
              "required": true,
              "properties": {
                "type": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                },
                "amount": {
                  "type": "number",
                  "required": true,
                  "description": "The amount to be discounted. This value is for display purposes only."
                },
                "code": {
                  "type": "string",
                  "required": true,
                  "description": "The coupon code number."
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The coupon description."
                }
              }
            },
                  "description": "An array of adjustments applied to the cart."
                }
              }
            }

## Checkout [/cart/checkout]
### Checkout [POST]
Send checkout information for the current cart.

* paymentMethod: Payment method to use. If `billingAddressSameAsShipping` is false, the billing address can be found in that object

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            {
              "paymentMethod": {
                "type": "card",
                "paymentObject": {
                  "cardNumber": "4111111111111111",
                  "cvv": "123",
                  "nameOnCard": "John Snow",
                  "expirationDate": "2017-09",
                  "billingAddress": {
                    "id": "1234",
                    "firstName": "James",
                    "lastName": "Bond",
                    "address1": "10001 Johnson St",
                    "address2": null,
                    "city": "Novato",
                    "state": "CA",
                    "country": "US",
                    "zip": "94949",
                    "phone": "4151515555",
                    "save": true,
                    "isPrimary": false
                  }
                }
              }
            }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "orderId": "12345678"
            }

    + Schema

            {
              "title": "CartCheckoutResponsePost",
              "type": [
                "object",
                "null"
              ],
              "description": "This is the response returned after a checkout is posted.",
              "required": true,
              "properties": {
                "orderId": {
                  "type": "string",
                  "required": true,
                  "description": "The id of the order."
                }
              }
            }

# Group Categories
The endpoints used to get categories information.

Typically used to get the menu navigation items.

## Categories Collection [/categories{?parentCategoryId}]
### Get Category Collection [GET]
## Search Suggestions [/products/search-suggestions{?keyword}]
Returns a list of all categories (flat representation), including their sub-categories and parent categories Ids

+ Parameters
    + parentCategoryId = `` (string, optional, `12345`) ... The parent category id used to get a list of subCategories. If no `parentCategoryId` is passed in, a flat array containing all categories will be passed back. If `parentCategoryId` is passed in and valid, only the subcategories of that id will be passed back.

# Group Countries
The endpoints used to get country information.

## Countries Collection [/countries]
### Get Country Collection [GET]
Used to get country codes for shipping and billing addresses
Returns a list of all countries (flat representation)

+ Response 200 (application/json; charset=utf-8)
    + Body

            [
              {
                "id": "US",
                "name": "United States"
              }
            ]

    + Schema

            {
              "title": "CountryCollection",
              "type": [
                "object",
                "null"
              ],
              "description": "An array of `Country` objects.",
              "required": true,
              "minItems": 0,
              "items": {
                "title": "Country",
                "type": [
                  "object",
                  "null"
                ],
                "description": "Describes a region.  It is used for both countries and states.",
                "required": true,
                "properties": {
                  "id": {
                    "type": "string",
                    "required": true,
                    "description": "The id or code for the region."
                  },
                  "name": {
                    "type": "string",
                    "required": true,
                    "description": "The display name of the region."
                  }
                }
              }
            }

## Country [/countries/{id}]
### Get Country Info [GET]
Returns all of the regions (states) within that country.

+ Parameters
    + id = `` (string, `US`) ... The country code used to get more specific information.

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "US",
              "name": "United States"
            }

    + Schema

            {
              "title": "Country",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a region.  It is used for both countries and states.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "The id or code for the region."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "The display name of the region."
                }
              }
            }

# Group Orders
Represents an order.

## Order Collection [/orders]
### Get Orders [GET]
Returns the order history of the current user.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

+ Response 200 (application/json; charset=utf-8)
    + Body

            [
              {
                "id": "123456",
                "orderDate": "1997-07-16T19:20:30+01:00",
                "lastUpdated": "1997-07-16T19:20:30+01:00",
                "status": {
                  "statusText": "shipped",
                  "trackingNumber": "123456",
                  "deliveryDate": [
                    "2014-07-16",
                    "2014-07-19"
                  ]
                },
                "trackingNumber": "123456",
                "itemCount": 1,
                "itemTotalCount": 5,
                "subTotal": 299.99,
                "tax": 9.88,
                "totalAdjustment": -100,
                "total": 199.99
              }
            ]

    + Schema

            {
              "title": "ShortOrderCollection",
              "type": [
                "object",
                "null"
              ],
              "description": "A collection of short orders.",
              "required": true,
              "minItems": 0,
              "items": {
                "title": "ShortOrder",
                "type": [
                  "object",
                  "null"
                ],
                "description": "Short form of the order, providing high level information about an order.",
                "required": true,
                "properties": {
                  "id": {
                    "type": "string",
                    "required": true,
                    "description": "The id of the order."
                  },
                  "orderDate": {
                    "type": "string",
                    "required": true,
                    "description": "The date the order was made. ISO format."
                  },
                  "lastUpdated": {
                    "type": "string",
                    "required": false,
                    "description": "The date the order was last updated. ISO format."
                  },
                  "status": {
                    "title": "OrderStatus",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Provides details to the status of the order.",
                    "required": true,
                    "properties": {
                      "statusText": {
                        "type": "string",
                        "enum": [
                          "pending",
                          "ordered",
                          "shipped",
                          "delivered"
                        ],
                        "required": true,
                        "description": "The status of the order."
                      },
                      "trackingNumber": {
                        "type": "string",
                        "required": true,
                        "description": "The tracking number for the order. Will only be present after the order has shipped if at all."
                      },
                      "deliveryDate": {
                        "type": "array",
                        "required": true,
                        "minItems": 0,
                        "maxItems": 2,
                        "description": "The estimated delivery date. Contains one date if status is delivered. Contains a date OR date range if status is different from delivered.",
                        "items": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "itemCount": {
                    "type": "integer",
                    "required": true,
                    "description": "Number of different cart items, regardless of the quantity for each item. Should be calculated server side in case the response is paginated."
                  },
                  "itemTotalCount": {
                    "type": "integer",
                    "required": true,
                    "description": "Total number of items in the cart. Represents the sum of the quantities for each cart item. Should be calculated server side in case the response is paginated."
                  },
                  "tax": {
                    "type": "number",
                    "required": false,
                    "description": "Tax on the order."
                  },
                  "subTotal": {
                    "type": "number",
                    "required": true,
                    "description": "Total cost prior to applying adjustments."
                  },
                  "totalAdjustment": {
                    "type": "number",
                    "required": true,
                    "description": "Total amount removed from the original total."
                  },
                  "total": {
                    "type": "number",
                    "required": true,
                    "description": "Total cost of the order."
                  }
                }
              }
            }

## Get Order [/orders/{id}]
### Get Order [GET]
Returns the order of the given id.

+ Parameters
    + id = `` (string, `12345`) ... The `id` of the order.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "123456",
              "orderDate": "1997-07-16T19:20:30+01:00",
              "lastUpdated": "1997-07-16T19:20:30+01:00",
              "status": {
                "statusText": "shipped",
                "trackingNumber": "123456",
                "deliveryDate": [
                  "2014-07-16",
                  "2014-07-19"
                ]
              },
              "trackingNumber": "123456",
              "itemCount": 1,
              "itemTotalCount": 5,
              "subTotal": 299.99,
              "tax": 9.88,
              "totalAdjustment": -100,
              "total": 199.99,
              "orderItems": [
                {
                  "id": "123456",
                  "product": {
                    "id": "1234",
                    "name": "Vera",
                    "price": 45,
                    "discountedPrice": 40,
                    "description": "<p>Gorgeous lace ...",
                    "imageResources": {
                      "1": [
                        {
                          "url": "http://www.url1.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url2.jpg",
                          "usage": "small"
                        },
                        {
                          "url": "http://www.url3.jpg",
                          "usage": "large"
                        }
                      ],
                      "2": [
                        {
                          "url": "http://www.url4.jpg",
                          "usage": "thumbnail"
                        },
                        {
                          "url": "http://www.url6.jpg",
                          "usage": "large"
                        }
                      ]
                    },
                    "imageIds": [
                      "1",
                      "2"
                    ],
                    "categoryIds": [
                      "1",
                      "2",
                      "5"
                    ],
                    "wishlistIds": [
                      "1",
                      "2",
                      "5"
                    ]
                  },
                  "quantity": 5,
                  "sku": {
                    "id": "12345",
                    "isAvailable": true,
                    "availableQuantity": 4,
                    "price": 45,
                    "discountedPrice": 40,
                    "imageIds": [
                      "7",
                      "8"
                    ]
                  },
                  "personalizations": [
                    {
                      "id": "1",
                      "label": "Thread Color",
                      "type": "string",
                      "options": [
                        "Apple",
                        "Wisteria"
                      ],
                      "instructionsUrl": "http://www.url.com",
                      "selectedValue": null
                    }
                  ],
                  "otherSkusAvailable": true,
                  "adjustments": [
                    {
                      "type": "coupon",
                      "amount": -9.99,
                      "code": "SOME_CODE",
                      "description": "Save 20% on Furniture"
                    }
                  ],
                  "totalPrice": 1999.95,
                  "totalDiscountedPrice": 1499.95
                }
              ],
              "shippingAddress": {
                "id": "1234",
                "firstName": "James",
                "lastName": "Bond",
                "address1": "10001 Johnson St",
                "address2": null,
                "city": "Novato",
                "state": "CA",
                "country": "US",
                "zip": "94949",
                "phone": "4151515555",
                "save": true,
                "isPrimary": false
              },
              "shippingOption": {
                "id": "1",
                "name": "standard (4-5 days)",
                "price": 0
              },
              "paymentMethod": {
                "type": "card",
                "paymentObject": {
                  "cardType": "Visa",
                  "lastFour": "1111",
                  "billingAddress": {
                    "id": "1234",
                    "firstName": "James",
                    "lastName": "Bond",
                    "address1": "10001 Johnson St",
                    "address2": null,
                    "city": "Novato",
                    "state": "CA",
                    "country": "US",
                    "zip": "94949",
                    "phone": "4151515555",
                    "save": true,
                    "isPrimary": false
                  }
                }
              },
              "adjustments": [
                {
                  "type": "coupon",
                  "amount": -9.99,
                  "code": "SOME_CODE",
                  "description": "Save 20% on Furniture"
                }
              ]
            }

    + Schema

            {
              "title": "Order",
              "type": [
                "object",
                "null"
              ],
              "description": "The full order, detailing all information known about an order.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "The id of the order."
                },
                "orderDate": {
                  "type": "string",
                  "required": true,
                  "description": "The date the order was made. ISO format."
                },
                "lastUpdated": {
                  "type": "string",
                  "required": false,
                  "description": "The date the order was last updated. ISO format."
                },
                "status": {
              "title": "OrderStatus",
              "type": [
                "object",
                "null"
              ],
              "description": "Provides details to the status of the order.",
              "required": true,
              "properties": {
                "statusText": {
                  "type": "string",
                  "enum": [
                    "pending",
                    "ordered",
                    "shipped",
                    "delivered"
                  ],
                  "required": true,
                  "description": "The status of the order."
                },
                "trackingNumber": {
                  "type": "string",
                  "required": true,
                  "description": "The tracking number for the order. Will only be present after the order has shipped if at all."
                },
                "deliveryDate": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "maxItems": 2,
                  "description": "The estimated delivery date. Contains one date if status is delivered. Contains a date OR date range if status is different from delivered.",
                  "items": {
                    "type": "string"
                  }
                }
              }
            },
                "itemCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Number of different cart items, regardless of the quantity for each item. Should be calculated server side in case the response is paginated."
                },
                "itemTotalCount": {
                  "type": "integer",
                  "required": true,
                  "description": "Total number of items in the cart. Represents the sum of the quantities for each cart item. Should be calculated server side in case the response is paginated."
                },
                "tax": {
                  "type": "number",
                  "required": false,
                  "description": "Tax on the order."
                },
                "subTotal": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost prior to applying adjustments."
                },
                "totalAdjustment": {
                  "type": "number",
                  "required": true,
                  "description": "Total amount removed from the original total."
                },
                "total": {
                  "type": "number",
                  "required": true,
                  "description": "Total cost of the order."
                },
                "orderItems": {
                  "type": "array",
                  "required": true,
                  "minItems": 1,
                  "items": {
              "title": "CartItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an item that has been added to the cart.  Also used in order for orderItems.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of cart Item. Backend generated."
                },
                "product": {
                  "title": "ShortProduct",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Describes a shorten version of a product.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Identifier of product."
                    },
                    "name": {
                      "type": "string",
                      "required": true,
                      "description": "Name of product."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Full price of the product."
                    },
                    "discountedPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Sale price of the product."
                    },
                    "description": {
                      "type": "number",
                      "required": true,
                      "description": "Product`s description. Potentially contains HTML tags."
                    },
                    "imageResources": {
                      "type": "object",
                      "patternProperties": {
                        ".*": {
                          "type": "array",
                          "items": {{schema 'image' true}},
                          "required": true,
                          "minItems": 0
                        }
                      },
                      "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                    },
                    "categoryIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of category ids."
                    },
                    "wishlistIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of wishlist ids."
                    }
                  }
                },
                "quantity": {
                  "type": "integer",
                  "required": true,
                  "description": "The amount of that exact item (same sku, same personalizations) in the cart."
                },
                "sku": {
                  "title": "Sku",
                  "type": [
                    "object",
                    "null"
                  ],
                  "description": "Values of the selected SKU.",
                  "required": true,
                  "properties": {
                    "id": {
                      "type": "string",
                      "required": true,
                      "description": "Unique identifier for the SKU."
                    },
                    "isAvailable": {
                      "type": "boolean",
                      "required": true,
                      "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                    },
                    "availableQuantity": {
                      "type": [
                        "integer",
                        "null"
                      ],
                      "required": true,
                      "description": "Number of items available for this SKU."
                    },
                    "price": {
                      "type": "number",
                      "required": true,
                      "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                    },
                    "discountPrice": {
                      "type": [
                        "number",
                        "null"
                      ],
                      "required": true,
                      "description": "Discounted price of the SKU, overrides product `discountedPrice."
                    },
                    "imageIds": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "required": true,
                      "minItems": 0,
                      "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                    }
                  }
                },
                "personalizations": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "description": "An array of personalization selections."
                },
                "otherSkusAvailable": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Denotes if there are other skus of this product available."
                },
                "adjustments": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
                    "title": "Adjustment",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
                    "required": true,
                    "properties": {
                      "type": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                      },
                      "amount": {
                        "type": "number",
                        "required": true,
                        "description": "The amount to be discounted. This value is for display purposes only."
                      },
                      "code": {
                        "type": "string",
                        "required": true,
                        "description": "The coupon code number."
                      },
                      "description": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "The coupon description."
                      }
                    }
                  },
                  "description": "An array of *item specific* adjustments."
                },
                "totalPrice": {
                  "type": "number",
                  "required": true,
                  "description": "Product price times quantity."
                },
                "totalDiscountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Product discounted price times quantity. Does not take adjustments into account."
                }
              }
            },
                  "description": "An array of items part of the order."
                },
                "shippingAddress": {
              "title": "Address",
              "type": [
                "object",
                "null"
              ],
              "description": "Contains information pertaining to an address.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Unique identifier for the address."
                },
                "firstName": {
                  "type": "string",
                  "required": true,
                  "description": "First name on the address."
                },
                "lastName": {
                  "type": "string",
                  "required": true,
                  "description": "Last name on the address."
                },
                "address1": {
                  "type": "string",
                  "required": true,
                  "description": "First street address field."
                },
                "address2": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "Second street address field."
                },
                "city": {
                  "type": "string",
                  "required": true,
                  "description": "City on address."
                },
                "state": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "State (or region/province) on address. The recommendation for this value is for it to be a standard state/region/province abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
                },
                "country": {
                  "type": "string",
                  "required": true,
                  "description": "Country on address. The recommendation for this value is for it to be a standard country abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
                },
                "zip": {
                  "type": "string",
                  "required": true,
                  "description": "Postal code on address."
                },
                "phone": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "Phone number associated with address."
                },
                "save": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Used by some endpoints to store the address as a resource that can be used later."
                },
                "isPrimary": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Indicates whether or not the address is the default address."
                }
              }
            },
                "paymentMethod": {
              "title": "PaymentMethod",
              "type": [
                "object",
                "null"
              ],
              "description": "Provides information regarding a method of payment when it is returned.",
              "required": true,
              "properties": {
                "type": {
                  "type": "string",
                  "required": true,
                  "enum": [
                    "card"
                  ],
                  "description": "The type of payment method used."
                },
                "paymentObject": {
                  "type": "object",
                  "required": true,
                  "description": "Describes the paymentObject used.",
                  "properties": {
                    "cardType": {
                      "type": "string",
                      "required": true,
                      "description": "The type of credit card being use. e.g. Visa."
                    },
                    "lastFour": {
                      "type": "string",
                      "required": true,
                      "description": "Last four digits of the credit card."
                    },
                    "billingAddress": {
                      "title": "Address",
                      "type": [
                        "object",
                        "null"
                      ],
                      "description": "Contains information pertaining to an address.",
                      "required": true,
                      "properties": {
                        "id": {
                          "type": "string",
                          "required": true,
                          "description": "Unique identifier for the address."
                        },
                        "firstName": {
                          "type": "string",
                          "required": true,
                          "description": "First name on the address."
                        },
                        "lastName": {
                          "type": "string",
                          "required": true,
                          "description": "Last name on the address."
                        },
                        "address1": {
                          "type": "string",
                          "required": true,
                          "description": "First street address field."
                        },
                        "address2": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "required": true,
                          "description": "Second street address field."
                        },
                        "city": {
                          "type": "string",
                          "required": true,
                          "description": "City on address."
                        },
                        "state": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "required": true,
                          "description": "State (or region/province) on address. The recommendation for this value is for it to be a standard state/region/province abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
                        },
                        "country": {
                          "type": "string",
                          "required": true,
                          "description": "Country on address. The recommendation for this value is for it to be a standard country abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
                        },
                        "zip": {
                          "type": "string",
                          "required": true,
                          "description": "Postal code on address."
                        },
                        "phone": {
                          "type": [
                            "string",
                            "null"
                          ],
                          "required": true,
                          "description": "Phone number associated with address."
                        },
                        "save": {
                          "type": [
                            "boolean",
                            "null"
                          ],
                          "required": true,
                          "description": "Used by some endpoints to store the address as a resource that can be used later."
                        },
                        "isPrimary": {
                          "type": [
                            "boolean",
                            "null"
                          ],
                          "required": true,
                          "description": "Indicates whether or not the address is the default address."
                        }
                      }
                    }
                  }
                }
              }
            },
                "shippingOption": {
              "title": "ShippingOption",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an option for shipping an order.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Id of the shipping option."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "Name for that option."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Price for that option."
                }
              }
            },
                "adjustments": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
              "title": "Adjustment",
              "type": [
                "object",
                "null"
              ],
              "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
              "required": true,
              "properties": {
                "type": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                },
                "amount": {
                  "type": "number",
                  "required": true,
                  "description": "The amount to be discounted. This value is for display purposes only."
                },
                "code": {
                  "type": "string",
                  "required": true,
                  "description": "The coupon code number."
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The coupon description."
                }
              }
            },
                  "description": "An array of adjustments applied to the order."
                }
              }
            }

# Group Products
These are the endpoints regarding products.  They are used for browsing all of the products offered.
They provide endpoints for getting lists of products through search, as well as get details for a
specific product.

## Product [/products/{id}]
### Get Product [GET]
Gets the full product model for the given id.

+ Parameters
    + id = `` (string, `12345`) ... The id of the product.

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "1234",
              "name": "Vera",
              "price": 45,
              "discountedPrice": 40,
              "description": "<p>Gorgeous lace ...",
              "imageResources": {
                "1": [
                  {
                    "url": "http://www.url1.jpg",
                    "usage": "thumbnail"
                  },
                  {
                    "url": "http://www.url2.jpg",
                    "usage": "small"
                  },
                  {
                    "url": "http://www.url3.jpg",
                    "usage": "large"
                  }
                ],
                "2": [
                  {
                    "url": "http://www.url4.jpg",
                    "usage": "thumbnail"
                  },
                  {
                    "url": "http://www.url6.jpg",
                    "usage": "large"
                  }
                ]
              },
              "imageIds": [
                "1",
                "2"
              ],
              "categoryIds": [
                "1",
                "2",
                "5"
              ],
              "wishlistIds": [
                "1",
                "2",
                "5"
              ],
              "skus": [
                {
                  "id": "12345",
                  "isAvailable": true,
                  "availableQuantity": 4,
                  "price": 45,
                  "discountedPrice": 40,
                  "imageIds": [
                    "7",
                    "8"
                  ]
                }
              ],
              "personalizationOptions": [
                {
                  "id": "1",
                  "label": "Thread Color",
                  "type": "string",
                  "options": [
                    "Apple",
                    "Wisteria"
                  ],
                  "instructionsUrl": "http://www.url.com",
                  "selectedValue": null
                }
              ],
              "userReviews": {
                "userReviewsCount": 10,
                "userImagesCount": 5,
                "overallRating": 4.6,
                "maxRating": 5
              },
              "userImageIds": [
                "12",
                "13",
                "14"
              ],
              "tags": [
                "New",
                "Featured"
              ]
            }

    + Schema

            {
              "title": "Product",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a full product.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of product."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "Name of product."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Full price of the product."
                },
                "discountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Sale price of the product."
                },
                "description": {
                  "type": "number",
                  "required": true,
                  "description": "Product`s description. Potentially contains HTML tags."
                },
                "imageResources": {
                  "type": "object",
                  "patternProperties": {
                    ".*": {
                      "type": "array",
                      "items": {
                        "title": "Image",
                        "type": [
                          "object",
                          "null"
                        ],
                        "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                        "required": true,
                        "properties": {
                          "url": {
                            "type": "string",
                            "required": true,
                            "description": "Full URL to download the image."
                          },
                          "usage": {
                            "type": "string",
                            "enum": [
                              "thumbnail",
                              "small",
                              "large"
                            ],
                            "required": true,
                            "description": "Represents the context in which the image should be used."
                          }
                        }
                      },
                      "required": true,
                      "minItems": 0
                    }
                  },
                  "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                },
                "imageIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                },
                "categoryIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of category ids."
                },
                "wishlistIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of wishlist ids."
                },
                "skus": {
                  "type": "array",
                  "items": {
                    "title": "Sku",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Values of the selected SKU.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Unique identifier for the SKU."
                      },
                      "isAvailable": {
                        "type": "boolean",
                        "required": true,
                        "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                      },
                      "availableQuantity": {
                        "type": [
                          "integer",
                          "null"
                        ],
                        "required": true,
                        "description": "Number of items available for this SKU."
                      },
                      "price": {
                        "type": "number",
                        "required": true,
                        "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                      },
                      "discountPrice": {
                        "type": [
                          "number",
                          "null"
                        ],
                        "required": true,
                        "description": "Discounted price of the SKU, overrides product `discountedPrice."
                      },
                      "imageIds": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 1,
                  "description": "Collection of all available SKUs for this product."
                },
                "personalizationOptions": {
                  "type": "array",
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of all available SKUs for this product."
                },
                "userReviews": {
                  "title": "UserReviewSummary",
                  "type": "object",
                  "description": "Contains summary information of user reviews.",
                  "required": true,
                  "properties": {
                    "userReviewsCount": {
                      "type": "integer",
                      "required": true,
                      "description": "The total amount of user reviews."
                    },
                    "userImagesCount": {
                      "type": "integer",
                      "required": true,
                      "description": "The total number images in user reviews. Each review could have zero to many images."
                    },
                    "overallRating": {
                      "type": "number",
                      "required": true,
                      "description": "The average rating."
                    },
                    "maxRating": {
                      "type": "integer",
                      "required": true,
                      "description": "The highest possible rating a user can give (Minimum is assumed to be zero)."
                    }
                  }
                },
                "tags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of tags associated to the product."
                }
              }
            }

## Product Wishlist [/products/{id}/wishlist-ids]
### Update Wishlist [PUT]
Updates the wishlists that the product is in. Expects an array of wishlist ids.

+ Parameters
    + id = `` (string, `12345`) ... The `id` of the product.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            [
              "wishlistid1",
              "wishlistid2",
              "wishlistid3"
            ]

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "1234",
              "name": "Vera",
              "price": 45,
              "discountedPrice": 40,
              "description": "<p>Gorgeous lace ...",
              "imageResources": {
                "1": [
                  {
                    "url": "http://www.url1.jpg",
                    "usage": "thumbnail"
                  },
                  {
                    "url": "http://www.url2.jpg",
                    "usage": "small"
                  },
                  {
                    "url": "http://www.url3.jpg",
                    "usage": "large"
                  }
                ],
                "2": [
                  {
                    "url": "http://www.url4.jpg",
                    "usage": "thumbnail"
                  },
                  {
                    "url": "http://www.url6.jpg",
                    "usage": "large"
                  }
                ]
              },
              "imageIds": [
                "1",
                "2"
              ],
              "categoryIds": [
                "1",
                "2",
                "5"
              ],
              "wishlistIds": [
                "1",
                "2",
                "5"
              ],
              "skus": [
                {
                  "id": "12345",
                  "isAvailable": true,
                  "availableQuantity": 4,
                  "price": 45,
                  "discountedPrice": 40,
                  "imageIds": [
                    "7",
                    "8"
                  ]
                }
              ],
              "personalizationOptions": [
                {
                  "id": "1",
                  "label": "Thread Color",
                  "type": "string",
                  "options": [
                    "Apple",
                    "Wisteria"
                  ],
                  "instructionsUrl": "http://www.url.com",
                  "selectedValue": null
                }
              ],
              "userReviews": {
                "userReviewsCount": 10,
                "userImagesCount": 5,
                "overallRating": 4.6,
                "maxRating": 5
              },
              "userImageIds": [
                "12",
                "13",
                "14"
              ],
              "tags": [
                "New",
                "Featured"
              ]
            }

    + Schema

            {
              "title": "Product",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a full product.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of product."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "Name of product."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Full price of the product."
                },
                "discountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Sale price of the product."
                },
                "description": {
                  "type": "number",
                  "required": true,
                  "description": "Product`s description. Potentially contains HTML tags."
                },
                "imageResources": {
                  "type": "object",
                  "patternProperties": {
                    ".*": {
                      "type": "array",
                      "items": {
                        "title": "Image",
                        "type": [
                          "object",
                          "null"
                        ],
                        "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                        "required": true,
                        "properties": {
                          "url": {
                            "type": "string",
                            "required": true,
                            "description": "Full URL to download the image."
                          },
                          "usage": {
                            "type": "string",
                            "enum": [
                              "thumbnail",
                              "small",
                              "large"
                            ],
                            "required": true,
                            "description": "Represents the context in which the image should be used."
                          }
                        }
                      },
                      "required": true,
                      "minItems": 0
                    }
                  },
                  "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                },
                "imageIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                },
                "categoryIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of category ids."
                },
                "wishlistIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of wishlist ids."
                },
                "skus": {
                  "type": "array",
                  "items": {
                    "title": "Sku",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Values of the selected SKU.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Unique identifier for the SKU."
                      },
                      "isAvailable": {
                        "type": "boolean",
                        "required": true,
                        "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                      },
                      "availableQuantity": {
                        "type": [
                          "integer",
                          "null"
                        ],
                        "required": true,
                        "description": "Number of items available for this SKU."
                      },
                      "price": {
                        "type": "number",
                        "required": true,
                        "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                      },
                      "discountPrice": {
                        "type": [
                          "number",
                          "null"
                        ],
                        "required": true,
                        "description": "Discounted price of the SKU, overrides product `discountedPrice."
                      },
                      "imageIds": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 1,
                  "description": "Collection of all available SKUs for this product."
                },
                "personalizationOptions": {
                  "type": "array",
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of all available SKUs for this product."
                },
                "userReviews": {
                  "title": "UserReviewSummary",
                  "type": "object",
                  "description": "Contains summary information of user reviews.",
                  "required": true,
                  "properties": {
                    "userReviewsCount": {
                      "type": "integer",
                      "required": true,
                      "description": "The total amount of user reviews."
                    },
                    "userImagesCount": {
                      "type": "integer",
                      "required": true,
                      "description": "The total number images in user reviews. Each review could have zero to many images."
                    },
                    "overallRating": {
                      "type": "number",
                      "required": true,
                      "description": "The average rating."
                    },
                    "maxRating": {
                      "type": "integer",
                      "required": true,
                      "description": "The highest possible rating a user can give (Minimum is assumed to be zero)."
                    }
                  }
                },
                "tags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of tags associated to the product."
                }
              }
            }

## Search Suggestions [/products/search-suggestions{?keyword}]
### Product Search Suggestions [GET]
Used when user searches globally using the magnifying glass.
Returns a list of suggestions and a list of `Category` IDs given a search.

+ Parameters
    + keyword = `` (string, `dress`) ... The `keyword` used to search.

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "termSuggestions": [
                "Vera",
                "Cap Sleeve",
                "Ham"
              ],
              "categoryIds": [
                "1234",
                "423566",
                "collections/america-is-beautiful.html"
              ]
            }

    + Schema

            {
              "title": "SearchSuggestions",
              "type": [
                "object",
                "null"
              ],
              "description": "Contains search suggestions for keywords and categories.",
              "required": true,
              "properties": {
                "termSuggestions": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
                    "type": "string"
                  },
                  "description": "An array of suggested keywords to use in a search."
                },
                "categoryIds": {
                  "type": "array",
                  "required": true,
                  "minItems": 0,
                  "items": {
                    "type": "string"
                  },
                  "description": "An array of categoryIds to search by CDP."
                }
              }
            }

## Product Search [/products/search{?keyword,cat,filter,sort,order,offset,limit}]
### Product Search [GET]
* Used when user filters products within a given `Category`

* For flexibility the call should all to pass in multiple categories on top of filters

* Returns :
  * `products` : a list of `ShortProduct` given one or many categories and a list of filters.
  * `totalResults` : total number of results for the search query
  * `filters` : an array of `Filter` to be used with the search endpoint
  * `sortOptions` : an array of `SortOption` (`TODO` model) to be used with the search endpoint

* The list of filters should correspond to available filters for the entire list of products for that search, not just the current page (see pagination below)
TODO: Look into abstracted [pagination](https://bitbucket.org/prolificinteractive/engineering-standards/wiki/Prolific_Approach_to_Paging)

#### Combining Terms

TODO: Look into this ^

The `cat` and `<filter>` parameters may have multiple values as well as be listed multiple times as parameters. If another value is listed, it is considered an AND, if another whole parameter is listed, it's considered an OR.

E.g.

```
cat=1+4&cat=6
```

is equivalent to searching for categories (1 AND 2) OR 6

`NOTE` : operator subject to backend system technical compatibility


+ Parameters
    + keyword = `` (string, optional, `dress`) ... The `keyword` used to search.
    + cat = `` (string, optional, `123`) ... Filters by category using the category id.
    + filter = `` (string, optional, `filterValue`) ... Set using the available filters returned by a previous search. Each filter can be placed in here directly. <filter> is the name of the filter's id (e.g. 'color') and the value to send can be found in the entries 'value' field. Placeholder name, key to be replaced with actual filter name.
    + sort = `` (string, optional, `BestSellers`) ... The sort type. see `sortOptions` for possible values. If `order` is specified this should be specified.
    + order = `` (string, optional, `asc`) ... The order to sort by. See `sortOptions` for possible values. If `sort` is specified this should be specified.
    + offset = `` (string, optional, `0`) ... The index of the starting product of the resulting products. If `limit` is specified this should be specified.
    + limit = `` (string, optional, `10`) ... The number of products that should be returned. If `offset` is specified this should be specified.

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "1234",
              "name": "Vera",
              "price": 45,
              "discountedPrice": 40,
              "description": "<p>Gorgeous lace ...",
              "imageResources": {
                "1": [
                  {
                    "url": "http://www.url1.jpg",
                    "usage": "thumbnail"
                  },
                  {
                    "url": "http://www.url2.jpg",
                    "usage": "small"
                  },
                  {
                    "url": "http://www.url3.jpg",
                    "usage": "large"
                  }
                ],
                "2": [
                  {
                    "url": "http://www.url4.jpg",
                    "usage": "thumbnail"
                  },
                  {
                    "url": "http://www.url6.jpg",
                    "usage": "large"
                  }
                ]
              },
              "imageIds": [
                "1",
                "2"
              ],
              "categoryIds": [
                "1",
                "2",
                "5"
              ],
              "wishlistIds": [
                "1",
                "2",
                "5"
              ],
              "skus": [
                {
                  "id": "12345",
                  "isAvailable": true,
                  "availableQuantity": 4,
                  "price": 45,
                  "discountedPrice": 40,
                  "imageIds": [
                    "7",
                    "8"
                  ]
                }
              ],
              "personalizationOptions": [
                {
                  "id": "1",
                  "label": "Thread Color",
                  "type": "string",
                  "options": [
                    "Apple",
                    "Wisteria"
                  ],
                  "instructionsUrl": "http://www.url.com",
                  "selectedValue": null
                }
              ],
              "userReviews": {
                "userReviewsCount": 10,
                "userImagesCount": 5,
                "overallRating": 4.6,
                "maxRating": 5
              },
              "userImageIds": [
                "12",
                "13",
                "14"
              ],
              "tags": [
                "New",
                "Featured"
              ]
            }

    + Schema

            {
              "title": "Product",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a full product.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of product."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "Name of product."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Full price of the product."
                },
                "discountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Sale price of the product."
                },
                "description": {
                  "type": "number",
                  "required": true,
                  "description": "Product`s description. Potentially contains HTML tags."
                },
                "imageResources": {
                  "type": "object",
                  "patternProperties": {
                    ".*": {
                      "type": "array",
                      "items": {
                        "title": "Image",
                        "type": [
                          "object",
                          "null"
                        ],
                        "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                        "required": true,
                        "properties": {
                          "url": {
                            "type": "string",
                            "required": true,
                            "description": "Full URL to download the image."
                          },
                          "usage": {
                            "type": "string",
                            "enum": [
                              "thumbnail",
                              "small",
                              "large"
                            ],
                            "required": true,
                            "description": "Represents the context in which the image should be used."
                          }
                        }
                      },
                      "required": true,
                      "minItems": 0
                    }
                  },
                  "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                },
                "imageIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                },
                "categoryIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of category ids."
                },
                "wishlistIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of wishlist ids."
                },
                "skus": {
                  "type": "array",
                  "items": {
                    "title": "Sku",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Values of the selected SKU.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Unique identifier for the SKU."
                      },
                      "isAvailable": {
                        "type": "boolean",
                        "required": true,
                        "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                      },
                      "availableQuantity": {
                        "type": [
                          "integer",
                          "null"
                        ],
                        "required": true,
                        "description": "Number of items available for this SKU."
                      },
                      "price": {
                        "type": "number",
                        "required": true,
                        "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                      },
                      "discountPrice": {
                        "type": [
                          "number",
                          "null"
                        ],
                        "required": true,
                        "description": "Discounted price of the SKU, overrides product `discountedPrice."
                      },
                      "imageIds": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 1,
                  "description": "Collection of all available SKUs for this product."
                },
                "personalizationOptions": {
                  "type": "array",
                  "items": {
                    "title": "PersonalizationOption",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a way to personalize a product when adding to cart.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "label": {
                        "type": "string",
                        "required": true,
                        "description": "Name of the personalization field."
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "string",
                          "options"
                        ],
                        "required": true,
                        "description": "The type of the personalization field."
                      },
                      "options": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                      },
                      "instructionsUrl": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Link to an image for instructions, not all fields have this."
                      },
                      "selectedValue": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of all available SKUs for this product."
                },
                "userReviews": {
                  "title": "UserReviewSummary",
                  "type": "object",
                  "description": "Contains summary information of user reviews.",
                  "required": true,
                  "properties": {
                    "userReviewsCount": {
                      "type": "integer",
                      "required": true,
                      "description": "The total amount of user reviews."
                    },
                    "userImagesCount": {
                      "type": "integer",
                      "required": true,
                      "description": "The total number images in user reviews. Each review could have zero to many images."
                    },
                    "overallRating": {
                      "type": "number",
                      "required": true,
                      "description": "The average rating."
                    },
                    "maxRating": {
                      "type": "integer",
                      "required": true,
                      "description": "The highest possible rating a user can give (Minimum is assumed to be zero)."
                    }
                  }
                },
                "tags": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of tags associated to the product."
                }
              }
            }

## Product SKU [/products/{productId}/skus/{skuId}]
`TODO` Figure out why two ids breaks aglio

### Get Product SKU [GET]
Returns a `SKU` for a product given the id of the product and sku. Includes availableQuantity.

+ Parameters
    + productId = `` (string, `12345`) ... The id of the product.
    + skuId = `` (string, `12345`) ... The id of the sku.

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "12345",
              "isAvailable": true,
              "availableQuantity": 4,
              "price": 45,
              "discountedPrice": 40,
              "imageIds": [
                "7",
                "8"
              ]
            }

    + Schema

            {
              "title": "Sku",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a Stock Keeping Unit, which details a specific version of a product.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Unique identifier for the SKU."
                },
                "isAvailable": {
                  "type": "boolean",
                  "required": true,
                  "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                },
                "availableQuantity": {
                  "type": [
                    "integer",
                    "null"
                  ],
                  "required": true,
                  "description": "Number of items available for this SKU."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                },
                "discountPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Discounted price of the SKU, overrides product `discountedPrice."
                },
                "imageIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                }
              }
            }

# Group Shopview
The endpoints used to get country information.

## Shopview Data [/shopview]
### Get Shopview Information [GET]
Return all data needed for the shop view, which is usually the initial home page of the app. 

Returns 3 lists: 

* main navigation items for a carousel (or other open navigation UI)

* secondary navigation items (for instance featured `Category`)

* featured `Product
    

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "mainNavigation": [
                {
                  "images": [
                    {
                      "url": "http://img.url.jpg",
                      "usage": "small"
                    }
                  ],
                  "text": "Get this awesome thing",
                  "navigation": "myapp://products/PRODUCTID"
                },
                {
                  "images": [
                    {
                      "url": "http://img.url.jpg",
                      "usage": "small"
                    }
                  ],
                  "text": "Get this awesome thing",
                  "navigation": "myapp://products/PRODUCTID"
                }
              ],
              "secondaryNavigation": [
                {
                  "images": [
                    {
                      "url": "http://img.url.jpg",
                      "usage": "small"
                    }
                  ],
                  "text": "Get this awesome thing",
                  "navigation": "myapp://products/PRODUCTID"
                }
              ],
              "featuredProducts": [
                {
                  "id": "1234",
                  "name": "Vera",
                  "price": 45,
                  "discountedPrice": 40,
                  "description": "<p>Gorgeous lace ...",
                  "imageResources": {
                    "1": [
                      {
                        "url": "http://www.url1.jpg",
                        "usage": "thumbnail"
                      },
                      {
                        "url": "http://www.url2.jpg",
                        "usage": "small"
                      },
                      {
                        "url": "http://www.url3.jpg",
                        "usage": "large"
                      }
                    ],
                    "2": [
                      {
                        "url": "http://www.url4.jpg",
                        "usage": "thumbnail"
                      },
                      {
                        "url": "http://www.url6.jpg",
                        "usage": "large"
                      }
                    ]
                  },
                  "imageIds": [
                    "1",
                    "2"
                  ],
                  "categoryIds": [
                    "1",
                    "2",
                    "5"
                  ],
                  "wishlistIds": [
                    "1",
                    "2",
                    "5"
                  ]
                }
              ]
            }

    + Schema

            {
              "title": "Shopview",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes the main navigation menu.",
              "required": true,
              "properties": {
                "mainNavigation": {
                  "type": "array",
                  "items": {
                    "title": "NavigationItem",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a navigation item.  Usually contains a deeplink.",
                    "required": true,
                    "properties": {
                      "images": {
                        "type": "array",
                        "items": {
                          "title": "Image",
                          "type": [
                            "object",
                            "null"
                          ],
                          "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                          "required": true,
                          "properties": {
                            "url": {
                              "type": "string",
                              "required": true,
                              "description": "Full URL to download the image."
                            },
                            "usage": {
                              "type": "string",
                              "enum": [
                                "thumbnail",
                                "small",
                                "large"
                              ],
                              "required": true,
                              "description": "Represents the context in which the image should be used."
                            }
                          }
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of Image. Can be empty (if `text` exists)."
                      },
                      "text": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Extra text that may accompany the images in the navigation. Can be null (if `images` exists)."
                      },
                      "navigation": {
                        "type": "string",
                        "required": true,
                        "description": "Internal navugation URL. Supports linking directly to internal company interfaces. See main descriptions for more details"
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of 'NavigationItem'."
                },
                "secondaryNavigation": {
                  "type": "array",
                  "items": {
                    "title": "NavigationItem",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a navigation item.  Usually contains a deeplink.",
                    "required": true,
                    "properties": {
                      "images": {
                        "type": "array",
                        "items": {
                          "title": "Image",
                          "type": [
                            "object",
                            "null"
                          ],
                          "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                          "required": true,
                          "properties": {
                            "url": {
                              "type": "string",
                              "required": true,
                              "description": "Full URL to download the image."
                            },
                            "usage": {
                              "type": "string",
                              "enum": [
                                "thumbnail",
                                "small",
                                "large"
                              ],
                              "required": true,
                              "description": "Represents the context in which the image should be used."
                            }
                          }
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of Image. Can be empty (if `text` exists)."
                      },
                      "text": {
                        "type": [
                          "string",
                          "null"
                        ],
                        "required": true,
                        "description": "Extra text that may accompany the images in the navigation. Can be null (if `images` exists)."
                      },
                      "navigation": {
                        "type": "string",
                        "required": true,
                        "description": "Internal navugation URL. Supports linking directly to internal company interfaces. See main descriptions for more details"
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of 'NavigationItem'."
                },
                "featuredProducts": {
                  "type": "array",
                  "items": {
                    "title": "ShortProduct",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "Describes a shorten version of a product.",
                    "required": true,
                    "properties": {
                      "id": {
                        "type": "string",
                        "required": true,
                        "description": "Identifier of product."
                      },
                      "name": {
                        "type": "string",
                        "required": true,
                        "description": "Name of product."
                      },
                      "price": {
                        "type": "number",
                        "required": true,
                        "description": "Full price of the product."
                      },
                      "discountedPrice": {
                        "type": [
                          "number",
                          "null"
                        ],
                        "required": true,
                        "description": "Sale price of the product."
                      },
                      "description": {
                        "type": "number",
                        "required": true,
                        "description": "Product`s description. Potentially contains HTML tags."
                      },
                      "imageResources": {
                        "type": "object",
                        "patternProperties": {
                          ".*": {
                            "type": "array",
                            "items": {
                              "title": "Image",
                              "type": [
                                "object",
                                "null"
                              ],
                              "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                              "required": true,
                              "properties": {
                                "url": {
                                  "type": "string",
                                  "required": true,
                                  "description": "Full URL to download the image."
                                },
                                "usage": {
                                  "type": "string",
                                  "enum": [
                                    "thumbnail",
                                    "small",
                                    "large"
                                  ],
                                  "required": true,
                                  "description": "Represents the context in which the image should be used."
                                }
                              }
                            },
                            "required": true,
                            "minItems": 0
                          }
                        },
                        "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                      },
                      "imageIds": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                      },
                      "categoryIds": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of category ids."
                      },
                      "wishlistIds": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        },
                        "required": true,
                        "minItems": 0,
                        "description": "Collection of wishlist ids."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of 'ShortProduct'."
                }
              }
            }

# Group Wishlists
Represents the user's favorited items

## Wishlists Collection [/wishlists]
Endpoints that relate to the current user's collection of wishlists.

### Create Wishlist [POST]
Creates a wishlist for the current user.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            {
              "name": "My Wishlist"
            }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "1",
              "name": "My Wishlist",
              "itemCount": 12,
              "images": [
                {
                  "url": "http://img.url.jpg",
                  "usage": "small"
                }
              ]
            }

    + Schema

            {
              "title": "Wishlist",
              "type": [
                "object",
                "null"
              ],
              "required": true,
              "description": "A wishlist containing an array of short products and group information.",
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "The id of the wishlist."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "The display name of the wishlist."
                },
                "itemsCount": {
                  "type": [
                    "integer",
                    "null"
                  ],
                  "required": true,
                  "description": "The number of items in the wishlist."
                },
                "images": {
                  "type": "array",
                  "items": {
                    "title": "Image",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                    "required": true,
                    "properties": {
                      "url": {
                        "type": "string",
                        "required": true,
                        "description": "Full URL to download the image."
                      },
                      "usage": {
                        "type": "string",
                        "enum": [
                          "thumbnail",
                          "small",
                          "large"
                        ],
                        "required": true,
                        "description": "Represents the context in which the image should be used."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of images corresponding to some or all of the items."
                }
              }
            }

### Get Wishlists [GET]
The wishlists for the current user.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

+ Response 200 (application/json; charset=utf-8)
    + Body

            [
              {
                "id": "1",
                "name": "My Wishlist",
                "itemCount": 12,
                "images": [
                  {
                    "url": "http://img.url.jpg",
                    "usage": "small"
                  }
                ]
              }
            ]

    + Schema

            {
              "title": "WishlistCollection",
              "type": [
                "object",
                "null"
              ],
              "required": true,
              "minItems": 0,
              "description": "An array of wishlists.",
              "items": {
                "title": "Wishlist",
                "type": [
                  "object",
                  "null"
                ],
                "required": true,
                "description": "A wishlist containing an array of short products and group information.",
                "properties": {
                  "id": {
                    "type": "string",
                    "required": true,
                    "description": "The id of the wishlist."
                  },
                  "name": {
                    "type": "string",
                    "required": true,
                    "description": "The display name of the wishlist."
                  },
                  "itemsCount": {
                    "type": [
                      "integer",
                      "null"
                    ],
                    "required": true,
                    "description": "The number of items in the wishlist."
                  },
                  "images": {
                    "type": "array",
                    "items": {
                      "title": "Image",
                      "type": [
                        "object",
                        "null"
                      ],
                      "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                      "required": true,
                      "properties": {
                        "url": {
                          "type": "string",
                          "required": true,
                          "description": "Full URL to download the image."
                        },
                        "usage": {
                          "type": "string",
                          "enum": [
                            "thumbnail",
                            "small",
                            "large"
                          ],
                          "required": true,
                          "description": "Represents the context in which the image should be used."
                        }
                      }
                    },
                    "required": true,
                    "minItems": 0,
                    "description": "Collection of images corresponding to some or all of the items."
                  }
                }
              }
            }

## Wishlist [/wishlists/{id}]
These endpoints are for modifying a wishlist of the current user.

### Update Template [PUT]
Updates a wishlist's name.

+ Parameters
    + id = `` (string, `1234`) ... The `id` of the wishlist to rename.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

    + Body

            {
              "name": "My Wishlist"
            }

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "1",
              "name": "My Wishlist",
              "itemCount": 12,
              "images": [
                {
                  "url": "http://img.url.jpg",
                  "usage": "small"
                }
              ]
            }

    + Schema

            {
              "title": "Wishlist",
              "type": [
                "object",
                "null"
              ],
              "required": true,
              "description": "A wishlist containing an array of short products and group information.",
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "The id of the wishlist."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "The display name of the wishlist."
                },
                "itemsCount": {
                  "type": [
                    "integer",
                    "null"
                  ],
                  "required": true,
                  "description": "The number of items in the wishlist."
                },
                "images": {
                  "type": "array",
                  "items": {
                    "title": "Image",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                    "required": true,
                    "properties": {
                      "url": {
                        "type": "string",
                        "required": true,
                        "description": "Full URL to download the image."
                      },
                      "usage": {
                        "type": "string",
                        "enum": [
                          "thumbnail",
                          "small",
                          "large"
                        ],
                        "required": true,
                        "description": "Represents the context in which the image should be used."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of images corresponding to some or all of the items."
                }
              }
            }

### Delete Wishlist [DELETE]
Deletes a wishlist

+ Parameters
    + id = `` (string, `1234`) ... The `id` of the wishlist to delete.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

+ Response 200 (application/json; charset=utf-8)
    + Body

            {
              "id": "1",
              "name": "My Wishlist",
              "itemCount": 12,
              "images": [
                {
                  "url": "http://img.url.jpg",
                  "usage": "small"
                }
              ]
            }

    + Schema

            {
              "title": "Wishlist",
              "type": [
                "object",
                "null"
              ],
              "required": true,
              "description": "A wishlist containing an array of short products and group information.",
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "The id of the wishlist."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "The display name of the wishlist."
                },
                "itemsCount": {
                  "type": [
                    "integer",
                    "null"
                  ],
                  "required": true,
                  "description": "The number of items in the wishlist."
                },
                "images": {
                  "type": "array",
                  "items": {
                    "title": "Image",
                    "type": [
                      "object",
                      "null"
                    ],
                    "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                    "required": true,
                    "properties": {
                      "url": {
                        "type": "string",
                        "required": true,
                        "description": "Full URL to download the image."
                      },
                      "usage": {
                        "type": "string",
                        "enum": [
                          "thumbnail",
                          "small",
                          "large"
                        ],
                        "required": true,
                        "description": "Represents the context in which the image should be used."
                      }
                    }
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of images corresponding to some or all of the items."
                }
              }
            }

## Wishlist Products [/wishlists/{id}/products]
### Get Wishlist Products [GET]
Returns all of the products for the specified wishlist.

+ Parameters
    + id = `` (string, `1234`) ... The `id` of the wishlist to get products from.

+ Request (application/json; charset=utf-8)
    + Headers

            sessionId: 011111111111111111111111111111111

+ Response 200 (application/json; charset=utf-8)
    + Body

            [
              [
              [
                {{example 'shortProductCollection'}}
              ]
            ]
            ]

    + Schema

            {
              "title": "ShortProductCollection",
              "type": [
                "object",
                "null"
              ],
              "required": true,
              "minItems": 0,
              "description": "An array of `ShortProduct`.",
              "items": {
                "title": "ShortProduct",
                "type": [
                  "object",
                  "null"
                ],
                "description": "Describes a shorten version of a product.",
                "required": true,
                "properties": {
                  "id": {
                    "type": "string",
                    "required": true,
                    "description": "Identifier of product."
                  },
                  "name": {
                    "type": "string",
                    "required": true,
                    "description": "Name of product."
                  },
                  "price": {
                    "type": "number",
                    "required": true,
                    "description": "Full price of the product."
                  },
                  "discountedPrice": {
                    "type": [
                      "number",
                      "null"
                    ],
                    "required": true,
                    "description": "Sale price of the product."
                  },
                  "description": {
                    "type": "number",
                    "required": true,
                    "description": "Product`s description. Potentially contains HTML tags."
                  },
                  "imageResources": {
                    "type": "object",
                    "patternProperties": {
                      ".*": {
                        "type": "array",
                        "items": {
                          "title": "Image",
                          "type": [
                            "object",
                            "null"
                          ],
                          "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                          "required": true,
                          "properties": {
                            "url": {
                              "type": "string",
                              "required": true,
                              "description": "Full URL to download the image."
                            },
                            "usage": {
                              "type": "string",
                              "enum": [
                                "thumbnail",
                                "small",
                                "large"
                              ],
                              "required": true,
                              "description": "Represents the context in which the image should be used."
                            }
                          }
                        },
                        "required": true,
                        "minItems": 0
                      }
                    },
                    "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                  },
                  "imageIds": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "required": true,
                    "minItems": 0,
                    "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                  },
                  "categoryIds": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "required": true,
                    "minItems": 0,
                    "description": "Collection of category ids."
                  },
                  "wishlistIds": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "required": true,
                    "minItems": 0,
                    "description": "Collection of wishlist ids."
                  }
                }
              }
            }

# Group Address
This is the model for representing an address

#### Body

```
{
  "id": "1234",
  "firstName": "James",
  "lastName": "Bond",
  "address1": "10001 Johnson St",
  "address2": null,
  "city": "Novato",
  "state": "CA",
  "country": "US",
  "zip": "94949",
  "phone": "4151515555",
  "save": true,
  "isPrimary": false
}
```

#### Schema

```
{
  "title": "Address",
  "type": [
    "object",
    "null"
  ],
  "description": "Contains information pertaining to an address.",
  "required": true,
  "properties": {
    "id": {
      "type": "string",
      "required": true,
      "description": "Unique identifier for the address."
    },
    "firstName": {
      "type": "string",
      "required": true,
      "description": "First name on the address."
    },
    "lastName": {
      "type": "string",
      "required": true,
      "description": "Last name on the address."
    },
    "address1": {
      "type": "string",
      "required": true,
      "description": "First street address field."
    },
    "address2": {
      "type": [
        "string",
        "null"
      ],
      "required": true,
      "description": "Second street address field."
    },
    "city": {
      "type": "string",
      "required": true,
      "description": "City on address."
    },
    "state": {
      "type": [
        "string",
        "null"
      ],
      "required": true,
      "description": "State (or region/province) on address. The recommendation for this value is for it to be a standard state/region/province abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
    },
    "country": {
      "type": "string",
      "required": true,
      "description": "Country on address. The recommendation for this value is for it to be a standard country abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
    },
    "zip": {
      "type": "string",
      "required": true,
      "description": "Postal code on address."
    },
    "phone": {
      "type": [
        "string",
        "null"
      ],
      "required": true,
      "description": "Phone number associated with address."
    },
    "save": {
      "type": [
        "boolean",
        "null"
      ],
      "required": true,
      "description": "Used by some endpoints to store the address as a resource that can be used later."
    },
    "isPrimary": {
      "type": [
        "boolean",
        "null"
      ],
      "required": true,
      "description": "Indicates whether or not the address is the default address."
    }
  }
}
```

# Group Adjustment
This is the model used to describe a coupon / promocode

#### Body

```
{
  "type": "coupon",
  "amount": -9.99,
  "code": "SOME_CODE",
  "description": "Save 20% on Furniture"
}
```

#### Schema

```
{
  "title": "Adjustment",
  "type": [
    "object",
    "null"
  ],
  "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
  "required": true,
  "properties": {
    "type": {
      "type": [
        "string",
        "null"
      ],
      "required": true,
      "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
    },
    "amount": {
      "type": "number",
      "required": true,
      "description": "The amount to be discounted. This value is for display purposes only."
    },
    "code": {
      "type": "string",
      "required": true,
      "description": "The coupon code number."
    },
    "description": {
      "type": [
        "string",
        "null"
      ],
      "required": true,
      "description": "The coupon description."
    }
  }
}
```

# Group CartItem
Object used to describe a cart item. 

The same object is used when updating the cart (partial object).

#### Body

```
{
  "id": "123456",
  "product": {
    "id": "1234",
    "name": "Vera",
    "price": 45,
    "discountedPrice": 40,
    "description": "<p>Gorgeous lace ...",
    "imageResources": {
      "1": [
        {
          "url": "http://www.url1.jpg",
          "usage": "thumbnail"
        },
        {
          "url": "http://www.url2.jpg",
          "usage": "small"
        },
        {
          "url": "http://www.url3.jpg",
          "usage": "large"
        }
      ],
      "2": [
        {
          "url": "http://www.url4.jpg",
          "usage": "thumbnail"
        },
        {
          "url": "http://www.url6.jpg",
          "usage": "large"
        }
      ]
    },
    "imageIds": [
      "1",
      "2"
    ],
    "categoryIds": [
      "1",
      "2",
      "5"
    ],
    "wishlistIds": [
      "1",
      "2",
      "5"
    ]
  },
  "quantity": 5,
  "sku": {
    "id": "12345",
    "isAvailable": true,
    "availableQuantity": 4,
    "price": 45,
    "discountedPrice": 40,
    "imageIds": [
      "7",
      "8"
    ]
  },
  "personalizations": [
    {
      "id": "1",
      "label": "Thread Color",
      "type": "string",
      "options": [
        "Apple",
        "Wisteria"
      ],
      "instructionsUrl": "http://www.url.com",
      "selectedValue": null
    }
  ],
  "otherSkusAvailable": true,
  "adjustments": [
    {
      "type": "coupon",
      "amount": -9.99,
      "code": "SOME_CODE",
      "description": "Save 20% on Furniture"
    }
  ],
  "totalPrice": 1999.95,
  "totalDiscountedPrice": 1499.95
}
```

#### Schema

```
{
              "title": "CartItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes an item that has been added to the cart.  Also used in order for orderItems.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of cart Item. Backend generated."
                },
                "product": {
              "title": "ShortProduct",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a shorten version of a product.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of product."
                },
                "name": {
                  "type": "string",
                  "required": true,
                  "description": "Name of product."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Full price of the product."
                },
                "discountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Sale price of the product."
                },
                "description": {
                  "type": "number",
                  "required": true,
                  "description": "Product`s description. Potentially contains HTML tags."
                },
                "imageResources": {
                  "type": "object",
                  "patternProperties": {
                    ".*": {
                      "type": "array",
                      "items": {
                        "title": "Image",
                        "type": [
                          "object",
                          "null"
                        ],
                        "description": "For pattern style colors that can't be defined with a hex code (e.g. plaid, stripes)",
                        "required": true,
                        "properties": {
                          "url": {
                            "type": "string",
                            "required": true,
                            "description": "Full URL to download the image."
                          },
                          "usage": {
                            "type": "string",
                            "enum": [
                              "thumbnail",
                              "small",
                              "large"
                            ],
                            "required": true,
                            "description": "Represents the context in which the image should be used."
                          }
                        }
                      },
                      "required": true,
                      "minItems": 0
                    }
                  },
                  "description": "A dictionary of all available images for that product. Each key represents an ID, and the corresponding value is a collection of `Image` objects.Should contain images to be displayed in the main carousel, product variations images."
                },
                "imageIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of image ids to be displayed in the main carousel. Those IDs should be ordered in the way they are expected to be presented to the user and present in `imageResources`. Typically for a PDP the first image in the array will show up first."
                },
                "categoryIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of category ids."
                },
                "wishlistIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of wishlist ids."
                }
              }
            },
                "quantity": {
                  "type": "integer",
                  "required": true,
                  "description": "The amount of that exact item (same sku, same personalizations) in the cart."
                },
                "sku": {
              "title": "Sku",
              "type": [
                "object",
                "null"
              ],
              "description": "Values of the selected SKU.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Unique identifier for the SKU."
                },
                "isAvailable": {
                  "type": "boolean",
                  "required": true,
                  "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                },
                "availableQuantity": {
                  "type": [
                    "integer",
                    "null"
                  ],
                  "required": true,
                  "description": "Number of items available for this SKU."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                },
                "discountPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Discounted price of the SKU, overrides product `discountedPrice."
                },
                "imageIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                }
              }
            },
                "personalizations": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
              "title": "PersonalizationOption",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a way to personalize a product when adding to cart.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Identifier of product."
                },
                "label": {
                  "type": "string",
                  "required": true,
                  "description": "Name of the personalization field."
                },
                "type": {
                  "type": "string",
                  "enum": [
                    "string",
                    "options"
                  ],
                  "required": true,
                  "description": "The type of the personalization field."
                },
                "options": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Array containing the possible values for this field. Only set when `type` == 'options'."
                },
                "instructionsUrl": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "Link to an image for instructions, not all fields have this."
                },
                "selectedValue": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "Value that has been selected for that field. Will **always** be null in the product object, and not null in the cart."
                }
              }
            },
                  "description": "An array of personalization selections."
                },
                "otherSkusAvailable": {
                  "type": [
                    "boolean",
                    "null"
                  ],
                  "required": true,
                  "description": "Denotes if there are other skus of this product available."
                },
                "adjustments": {
                  "type": "array",
                  "minItems": 0,
                  "required": true,
                  "items": {
              "title": "Adjustment",
              "type": [
                "object",
                "null"
              ],
              "description": "A modification made to a cart, cartItem, or order.  Usually from a coupon or promo code.",
              "required": true,
              "properties": {
                "type": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The type of adjustment, e.g. 'coupon', 'giftcard'."
                },
                "amount": {
                  "type": "number",
                  "required": true,
                  "description": "The amount to be discounted. This value is for display purposes only."
                },
                "code": {
                  "type": "string",
                  "required": true,
                  "description": "The coupon code number."
                },
                "description": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "The coupon description."
                }
              }
            },
                  "description": "An array of *item specific* adjustments."
                },
                "totalPrice": {
                  "type": "number",
                  "required": true,
                  "description": "Product price times quantity."
                },
                "totalDiscountedPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Product discounted price times quantity. Does not take adjustments into account."
                }
              }
            }
```


# Group Color
This is the model for the colors object.  This object is only found in the SKU object.

#### Body

```
{
  "id": "red",
  "label": "Red",
  "hex": "#FF0000",
  "imagePattern": {
    "url": "http://img.url.jpg",
    "usage": "small"
  }
}
```

#### Schema

```
{
  "title": "Color",
  "type": [
    "object",
    "null"
  ],
  "description": "Describes a color by hex value or an image pattern.",
  "required": true,
  "properties": {
    "hex": {
      "type": [
        "string",
        "null"
      ],
      "required": true,
      "description": "The hex value of the color."
    },
    "id": {
      "type": "string",
      "required": true,
      "description": "The id of the color."
    },
    "imagePattern": {
      "title": "Image",
      "type": [
        "object",
        "null"
      ],
      "description": "For pattern style colors that can\\'t be defined with a hex code (e.g. plaid, stripes)",
      "required": true,
      "properties": {
        "url": {
          "type": "string",
          "required": true,
          "description": "Full URL to download the image."
        },
        "usage": {
          "type": "string",
          "enum": [
            "thumbnail",
            "small",
            "large"
          ],
          "required": true,
          "description": "Represents the context in which the image should be used."
        }
      }
    },
    "label": {
      "type": "string",
      "required": true,
      "description": "The display name of the color."
    }
  }
}
```

# Group Error
Model used to represent an error that occurred while processing a request.

#### Body

```
{
  "code": 123,
  "message": "This is a user friendly message."
}
```

#### Schema

```
{
  "title": "Error",
  "type": [
    "object",
    "null"
  ],
  "description": "Describes an API error response.",
  "required": true,
  "properties": {
    "code": {
      "type": "integer",
      "required": true,
      "description": "An error identifier used for API error."
    },
    "message": {
      "type": "string",
      "required": true,
      "description": "A human (end user friendly) readable/comprehensible description of the error."
    }
  }
}
```

### Error List

##### Not Logged In (403)

```
{
  "code": 1000,
  "message": "You must be logged in."
}
```

##### Endpoint disabled (501)

```
{
  "code": 9001,
  "message": "This endpoint is disabled."
}
```

##### Unknown (500)

```
{
  "code": 9000,
  "message": "An unknown error has occurred."
}
```

# Group Filter
This is the model for the filter object.

#### Body

```
{
  "name": "Color",
  "id": "color",
  "entries": [
    {
      "value": "bluish",
      "label": "Blue-ish",
      "quantity": 1,
      "hex": "#1111AA"
    },
    {
      "value": "redish",
      "label": "Red-ish",
      "quantity": 3,
      "hex": "#991122"
    }
  ]
}
```

#### Schema

```
{
  "title": "Filter",
  "type": [
    "object",
    "null"
  ],
  "description": "Describes a filter used for product searches.",
  "required": true,
  "properties": {
    "name": {
      "type": "string",
      "required": true,
      "description": "The display name of the filter."
    },
    "id": {
      "type": "string",
      "required": true,
      "description": "The key used to make a search using this filter."
    },
    "entries": {
      "type": "array",
      "required": true,
      "minItems": 0,
      "items": {
        "type": "object",
        "properties": {
          "value": {
            "type": "string",
            "required": true,
            "description": "The value that should be used when searching for the filter."
          },
          "label": {
            "type": "string",
            "required": true,
            "description": "The label that appears for this value"
          },
          "quantity": {
            "type": [
              "integer",
              "null"
            ],
            "required": true,
            "description": "The amount of products available with this filter."
          }
        },
        "patternProperties": {
          ".*": {
            "type": [
              "string",
              "null"
            ],
            "required": true,
            "description": "Custom properties that may apply to this filter. e.g. 'hex': '#1111AA'"
          }
        }
      }
    }
  }
}
```

# Group Image
This is the model for the image object.

Images will be sent along with information about their usage. typically representing their size.

All available sizes for a given image should be included in a response. The front end will be responsible to determine which one best suits a given situation

Images can be used in 2 different ways : 

* an array of Image objects. One to many usages should be presented. For an example check `categories` endpoint

* a dictionary of image resources, containing an array of `Image` objects for each key, the key being an ID. When this is used in a response any reference to an image should reference those IDs. For an example see `Product`. Images are specified in the `imageResources` object, and referenced in other objects such as `imageIds` or `skus.imageIds`

#### Body

```
{
  "url": "http://img.url.jpg",
  "usage": "small"
}
```

#### Schema

```
{
  "title": "Image",
  "type": [
    "object",
    "null"
  ],
  "description": "Describes an images size and url.",
  "required": true,
  "properties": {
    "url": {
      "type": "string",
      "required": true,
      "description": "Full URL to download the image."
    },
    "usage": {
      "type": "string",
      "enum": [
        "thumbnail",
        "small",
        "large"
      ],
      "required": true,
      "description": "Represents the context in which the image should be used."
    }
  }
}
```

# Group NavigationItem
This is the model for the navigation Item object.  Typically used to populate an e-Commerce app custom shopView, usually used as the landing page, where custom elements can be displayed and lead to different sections of the app.

## Navigation object notes

* Supports linking directly to internal company interfaces. 

* Follows a protocol that should work seamlessly with deep linking. The URL Protocol should be the name of the app as the URL scheme followed by a formatted host + path combination (e.g. `twitter://<HOST>/<PATH>`). <HOST> can be http(s) if a webview is required. Here are some examples of `<HOST>/<PATH>` combinations:
    * `/products/<PRODUCTID>` - goes directly to a PDP
    * `/categories/<CATEGORYID>` - goes directly to a CDP
    * `/categories-list/<PARENTCATEGORYID>` - goes directly to a CLP
    * `/products/search?...` - maps directly to a search results page using the same parameters as the product search (see `Product`) so that they may be proxied right through

* From within the shopview it is also possible to load and push a webview. Simply pass a "normal" web address (e.g. `http://twitter.com`). This obviously doesn't work with deep linking

#### Body

```
{
  "images": [
    {
      "url": "http://img.url.jpg",
      "usage": "small"
    }
  ],
  "text": "Get this awesome thing",
  "navigation": "myapp://products/PRODUCTID"
}
```

#### Schema

```
{
              "title": "NavigationItem",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a navigation item.  Usually contains a deeplink.",
              "required": true,
              "properties": {
                "images": {
                  "type": "array",
                  "items": {
              "title": "Image",
              "type": [
                "object",
                "null"
              ],
              "description": "For pattern style colors that can\\'t be defined with a hex code (e.g. plaid, stripes)",
              "required": true,
              "properties": {
                "url": {
                  "type": "string",
                  "required": true,
                  "description": "Full URL to download the image."
                },
                "usage": {
                  "type": "string",
                  "enum": [
                    "thumbnail",
                    "small",
                    "large"
                  ],
                  "required": true,
                  "description": "Represents the context in which the image should be used."
                }
              }
            },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of Image. Can be empty (if `text` exists)."
                },
                "text": {
                  "type": [
                    "string",
                    "null"
                  ],
                  "required": true,
                  "description": "Extra text that may accompany the images in the navigation. Can be null (if `images` exists)."
                },
                "navigation": {
                  "type": "string",
                  "required": true,
                  "description": "Internal navugation URL. Supports linking directly to internal company interfaces. See main descriptions for more details"
                }
              }
            }
```

# Group OrderStatus
Object representing the status of an order, whether or not it's been delivered

#### Body

```
{
  "statusText": "shipped",
  "trackingNumber": "123456",
  "deliveryDate": [
    "2014-07-16",
    "2014-07-19"
  ]
}
```

#### Schema

```
{
  "title": "OrderStatus",
  "type": [
    "object",
    "null"
  ],
  "description": "Provides details to the status of the order.",
  "required": true,
  "properties": {
    "statusText": {
      "type": "string",
      "enum": [
        "pending",
        "ordered",
        "shipped",
        "delivered"
      ],
      "required": true,
      "description": "The status of the order."
    },
    "trackingNumber": {
      "type": "string",
      "required": true,
      "description": "The tracking number for the order. Will only be present after the order has shipped if at all."
    },
    "deliveryDate": {
      "type": "array",
      "required": true,
      "minItems": 0,
      "maxItems": 2,
      "description": "The estimated delivery date. Contains one date if status is delivered. Contains a date OR date range if status is different from delivered.",
      "items": {
        "type": "string"
      }
    }
  }
}
```

# Group PaymentMethod
Model for representing a way something was payed for.

### Request

The structure when a `paymentMethod` sent to the API to be processed
or saved.

#### Body

```
{
  "type": "card",
  "paymentObject": {
    "cardNumber": "4111111111111111",
    "cvv": "123",
    "nameOnCard": "John Snow",
    "expirationDate": "2017-09",
    "billingAddress": {
      "id": "1234",
      "firstName": "James",
      "lastName": "Bond",
      "address1": "10001 Johnson St",
      "address2": null,
      "city": "Novato",
      "state": "CA",
      "country": "US",
      "zip": "94949",
      "phone": "4151515555",
      "save": true,
      "isPrimary": false
    }
  }
}
```

#### Schema

```
{
  "title": "PaymentMethod",
  "type": [
    "object",
    "null"
  ],
  "description": "Provides information regarding a method of payment when used in a request.",
  "required": true,
  "properties": {
    "type": {
      "type": "string",
      "required": true,
      "enum": [
        "card"
      ],
      "description": "The type of payment method used."
    },
    "paymentObject": {
      "type": "object",
      "required": true,
      "description": "Describes the paymentObject used.",
      "properties": {
        "cardNumber": {
          "type": "string",
          "required": true,
          "description": "Full credit card number."
        },
        "expirationDate": {
          "type": "string",
          "required": true,
          "description": "The expiration date of the card."
        },
        "cvv": {
          "type": "string",
          "required": true,
          "description": "Security code for the card."
        },
        "nameOnCard": {
          "type": "string",
          "required": true,
          "description": "Name on the card."
        },
        "billingAddress": {
          "title": "Address",
          "type": [
            "object",
            "null"
          ],
          "description": "Contains information pertaining to an address.",
          "required": true,
          "properties": {
            "id": {
              "type": "string",
              "required": true,
              "description": "Unique identifier for the address."
            },
            "firstName": {
              "type": "string",
              "required": true,
              "description": "First name on the address."
            },
            "lastName": {
              "type": "string",
              "required": true,
              "description": "Last name on the address."
            },
            "address1": {
              "type": "string",
              "required": true,
              "description": "First street address field."
            },
            "address2": {
              "type": [
                "string",
                "null"
              ],
              "required": true,
              "description": "Second street address field."
            },
            "city": {
              "type": "string",
              "required": true,
              "description": "City on address."
            },
            "state": {
              "type": [
                "string",
                "null"
              ],
              "required": true,
              "description": "State (or region/province) on address. The recommendation for this value is for it to be a standard state/region/province abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
            },
            "country": {
              "type": "string",
              "required": true,
              "description": "Country on address. The recommendation for this value is for it to be a standard country abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
            },
            "zip": {
              "type": "string",
              "required": true,
              "description": "Postal code on address."
            },
            "phone": {
              "type": [
                "string",
                "null"
              ],
              "required": true,
              "description": "Phone number associated with address."
            },
            "save": {
              "type": [
                "boolean",
                "null"
              ],
              "required": true,
              "description": "Used by some endpoints to store the address as a resource that can be used later."
            },
            "isPrimary": {
              "type": [
                "boolean",
                "null"
              ],
              "required": true,
              "description": "Indicates whether or not the address is the default address."
            }
          }
        }
      }
    }
  }
}
```

### Response

The structure when a `paymentMethod` is returned from the API.

#### Body

```
{
  "type": "card",
  "paymentObject": {
    "cardType": "Visa",
    "lastFour": "1111",
    "billingAddress": {
      "id": "1234",
      "firstName": "James",
      "lastName": "Bond",
      "address1": "10001 Johnson St",
      "address2": null,
      "city": "Novato",
      "state": "CA",
      "country": "US",
      "zip": "94949",
      "phone": "4151515555",
      "save": true,
      "isPrimary": false
    }
  }
}
```

#### Schema

```
{
  "title": "PaymentMethod",
  "type": [
    "object",
    "null"
  ],
  "description": "Provides information regarding a method of payment when it is returned.",
  "required": true,
  "properties": {
    "type": {
      "type": "string",
      "required": true,
      "enum": [
        "card"
      ],
      "description": "The type of payment method used."
    },
    "paymentObject": {
      "type": "object",
      "required": true,
      "description": "Describes the paymentObject used.",
      "properties": {
        "cardType": {
          "type": "string",
          "required": true,
          "description": "The type of credit card being use. e.g. Visa."
        },
        "lastFour": {
          "type": "string",
          "required": true,
          "description": "Last four digits of the credit card."
        },
        "billingAddress": {
          "title": "Address",
          "type": [
            "object",
            "null"
          ],
          "description": "Contains information pertaining to an address.",
          "required": true,
          "properties": {
            "id": {
              "type": "string",
              "required": true,
              "description": "Unique identifier for the address."
            },
            "firstName": {
              "type": "string",
              "required": true,
              "description": "First name on the address."
            },
            "lastName": {
              "type": "string",
              "required": true,
              "description": "Last name on the address."
            },
            "address1": {
              "type": "string",
              "required": true,
              "description": "First street address field."
            },
            "address2": {
              "type": [
                "string",
                "null"
              ],
              "required": true,
              "description": "Second street address field."
            },
            "city": {
              "type": "string",
              "required": true,
              "description": "City on address."
            },
            "state": {
              "type": [
                "string",
                "null"
              ],
              "required": true,
              "description": "State (or region/province) on address. The recommendation for this value is for it to be a standard state/region/province abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
            },
            "country": {
              "type": "string",
              "required": true,
              "description": "Country on address. The recommendation for this value is for it to be a standard country abbreviation so that it can be used with the 'countries' endpoint, but implementations may vary depending on requirements."
            },
            "zip": {
              "type": "string",
              "required": true,
              "description": "Postal code on address."
            },
            "phone": {
              "type": [
                "string",
                "null"
              ],
              "required": true,
              "description": "Phone number associated with address."
            },
            "save": {
              "type": [
                "boolean",
                "null"
              ],
              "required": true,
              "description": "Used by some endpoints to store the address as a resource that can be used later."
            },
            "isPrimary": {
              "type": [
                "boolean",
                "null"
              ],
              "required": true,
              "description": "Indicates whether or not the address is the default address."
            }
          }
        }
      }
    }
  }
}
```

# Group ShippingOption
Represents a shipping option to be presented to the user.

#### Body

```
{
  "id": "1",
  "name": "standard (4-5 days)",
  "price": 0
}
```

#### Schema

```
{
  "title": "ShippingOption",
  "type": [
    "object",
    "null"
  ],
  "description": "Describes an option for shipping an order.",
  "required": true,
  "properties": {
    "id": {
      "type": "string",
      "required": true,
      "description": "Id of the shipping option."
    },
    "name": {
      "type": "string",
      "required": true,
      "description": "Name for that option."
    },
    "price": {
      "type": "number",
      "required": true,
      "description": "Price for that option."
    }
  }
}
```

# Group SKU
Model for representing a given `Product` variation. Stands for **S**tock **K**eeping **U**nit

The SKU might contain other custom fields depending on product offering, could vary from the following:

* color. type: `Color`

* size. type: string

* style. type: string

* etc.

The frontend is considered responsible for matching those values with reference hardcoded IDs and update the UI accordingly

`Note:` Using a separate model for color versus other attributes might be temporary. It's convenient for now but when time comes to evolve to handle more cases consider checking out comments in [this PR](https://bitbucket.org/prolificinteractive/engineering-standards/pull-request/12/updated-cleaned-up-the-sku-model-added-a/diff) or [this one](https://bitbucket.org/prolificinteractive/engineering-standards/pull-request/18/added-id-to-sku/diff).

`TODO`: The PRs referenced above will go away once we switch to the new repo. Consider keeping track of those comments if need be.

#### Body

```
{
  "id": "12345",
  "isAvailable": true,
  "availableQuantity": 4,
  "price": 45,
  "discountedPrice": 40,
  "imageIds": [
    "7",
    "8"
  ]
}
```

#### Schema

```
{
              "title": "Sku",
              "type": [
                "object",
                "null"
              ],
              "description": "Describes a Stock Keeping Unit, which details a specific version of a product.",
              "required": true,
              "properties": {
                "id": {
                  "type": "string",
                  "required": true,
                  "description": "Unique identifier for the SKU."
                },
                "isAvailable": {
                  "type": "boolean",
                  "required": true,
                  "description": "Indicates if a SKU is available or not. Needed in case availableQuantity can't be determined but is for sure > 0."
                },
                "availableQuantity": {
                  "type": [
                    "integer",
                    "null"
                  ],
                  "required": true,
                  "description": "Number of items available for this SKU."
                },
                "price": {
                  "type": "number",
                  "required": true,
                  "description": "Price for this SKU, prices could vary between SKUs, overrides product price."
                },
                "discountPrice": {
                  "type": [
                    "number",
                    "null"
                  ],
                  "required": true,
                  "description": "Discounted price of the SKU, overrides product `discountedPrice."
                },
                "imageIds": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "required": true,
                  "minItems": 0,
                  "description": "Collection of images IDs for that SKU. IDs referenced here must be listed in the imageResources dictionary that comes along with the product."
                }
              }
            }
```

# Group SortOption
This is the model for the sortOption object.

#### Body

```
{
  "label": "Bestsellers",
  "sort": "popularity",
  "order": "desc"
}
```

#### Schema

```
{
  "title": "SortOption",
  "type": [
    "object",
    "null"
  ],
  "description": "Contains information for a specific sort option for a search.",
  "required": true,
  "properties": {
    "label": {
      "type": "string",
      "required": true,
      "description": "The label for the sort option"
    },
    "sort": {
      "type": "string",
      "required": true,
      "description": "The arrangement type/category for the sort option e.g. 'popularity'"
    },
    "order": {
      "type": "string",
      "required": true,
      "description": "The arrangement for the sort option e.g. 'desc'"
    }
  }
}
```

