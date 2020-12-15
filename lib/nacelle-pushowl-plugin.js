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
    const productId = parseInt(
      decodeBase64Id(lineItem.pimSyncSourceProductId),
      10
    )
    const quantity = lineItem.quantity

    items.push({ variantId, productId, quantity })
  })

  const checkoutToken = ''

  return {
    checkoutToken,
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
  // if there is `showCart` query parameter, show the cart.
  // This parameter is sent in the redirect url from ACR push notification.
  if (typeof window !== 'undefined') {
    window.pushowl = window.pushowl || {
      queue: [],
      trigger: function (taskName, taskData) {
        return new Promise((resolve, reject) => {
          this.queue.push({
            taskName,
            taskData,
            promise: { resolve, reject }
          })
        })
      },
      init: function () {
        const subdomain = '<%= options.pushowl.subdomain %>'
        if (!subdomain) {
          return
        }
        this.subdomain = subdomain
        var s = document.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        s.src =
          'https://cdn.pushowl.com/sdks/pushowl-sdk.js?subdomain=' +
          subdomain +
          '&environment=production&shop=' +
          subdomain +
          '.myshopify.com'
        var x = document.getElementsByTagName('script')[0]
        x.parentNode.insertBefore(s, x)
      }
    }

    if (window.location.search.match(/showCart/)) {
      // HACK: We take action after sometime to avoid some `hideCart` events to override this call
      setTimeout(() => {
        ctx.store.commit('cart/showCart')
      }, 1000)
    }
  }

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
      const cart = cartToPushOwlObject(state.cart)
      window.pushowl.trigger('syncCart', cart)
    }

    /**
     * There are 3 mutations in a Nacelle store which can give us checkout
     * ID. We try to get checkout ID from each of them.
     */
    let checkoutId
    if (type === 'checkout/setCheckout') {
      checkoutId = atob(payload.id).match(/Checkout\/([^?/]+)/)[1]
    } else if (type === 'cart/setCheckoutId') {
      checkoutId = atob(payload).match(/Checkout\/([^?/]+)/)[1]
    } else if (type === 'events/addEvent' && payload.checkoutId) {
      checkoutId = payload.checkoutId
    }

    if (checkoutId) {
      window.pushowl.trigger('setCheckoutId', checkoutId)
    }

    if (type === 'account/setCustomer') {
      setCustomer(payload)
    }
  })
}
