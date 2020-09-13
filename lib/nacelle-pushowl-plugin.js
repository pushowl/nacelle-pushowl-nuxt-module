const decodeBase64Id = (encodedId) => {
  // Some IDs are like Z2lkOi8A3Mzg5MTM4Nw==::706db06f-4ce4-4f
  // We extract the base64 part from these.
  // After decoding, we can get strings like gid://shopify/variant/3423489374893

  if (encodedId && typeof encodedId === 'string') {
    const base64id = encodedId.split('::').shift()
    return Buffer.from(base64id, 'base64').toString('binary').split('/').pop()
  }
  return encodedId
}

const cartToPushOwlObject = (cart) => {
  const items = []

  cart.lineItems.map((lineItem) => {
    const variantId = parseInt(decodeBase64Id(lineItem.variant.id), 10)
    const productId = parseInt(decodeBase64Id(lineItem.id), 10)
    const quantity = lineItem.quantity

    items.push({ variantId, productId, quantity })
  })

  // const cartToken = atob(checkoutResponse.id).match(/Checkout\/(\S+)\?/)[1];
  const cartToken = ''

  return {
    token: cartToken,
    items
  }
}

const setCustomer = (customer) => {
  if (typeof window !== 'undefined') {
    if (customer.id) {
      const customerId = parseInt(decodeBase64Id(customer.id), 10)
      window.pushowl.trigger('setCustomerId', customerId)
    }
  }
}

export default function (ctx) {
  ctx.store.subscribe((mutation, state) => {
    const { type, payload } = mutation

    if (
      [
        'cart/addLineItemMutation',
        'cart/incrementLineItemMutation',
        'cart/decrementLineItemMutation',
        'cart/removeLineItemMutation'
      ].includes(type)
    ) {
      // console.log("CArt update", payload, mutation, state);
      const cart = cartToPushOwlObject(state.cart)
      window.pushowl.trigger('syncCart', cart)
    }

    if (type === 'account/setCustomer') {
      setCustomer(payload)
    }
  })
}
