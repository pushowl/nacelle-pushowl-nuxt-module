const base64IdToNumericId = (base64) => {
  // Some IDs are like Z2lkOi8A3Mzg5MTM4Nw==::706db06f-4ce4-4f
  // We extract the base64 part from these

  base64 = base64.replace(/::.*/, '')
  return parseInt(atob(base64).match(/\d+/)[0], 10)
}

const cartToPushOwlObject = (cart) => {
  const items = []

  cart.lineItems.map((lineItem) => {
    const variantId = base64IdToNumericId(lineItem.variant.id)
    const productId = base64IdToNumericId(lineItem.id)
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
    const _learnq = window._learnq || []
    if (customer.email) {
      _learnq.push([
        'identify',
        {
          $email: customer.email
        }
      ])
    }
  }
}

export default function (ctx) {
  ctx.store.subscribe((mutation, state) => {
    const { type, payload } = mutation

    console.log('mutation', type)

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
