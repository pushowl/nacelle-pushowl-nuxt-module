# Nacelle PushOwl Nuxt Module

## Requirements

- A Nacelle project set up locally. See https://docs.getnacelle.com for getting started.
- **IMPORTANT**: Only Shopify store backend is supported currently.
- A [PushOwl](https://pushowl.com) account and app installed on your Shopify store.

## Setup

### Add Module to Nacelle

Once you have Nacelle and PushOwl set up you can install this module in your project from `npm`:

```
npm install nacelle-pushowl-nuxt-module --save
```

After the package has installed, open `nuxt.config.js`. Under `modules` add `@nacelle/nacelle-klaviyo-nuxt-module` to the array. It should look something like this:

```
modules: [
  '@nuxtjs/pwa',
  '@nuxtjs/dotenv',
  '@nacelle/nacelle-nuxt-module',
  '@nuxtjs/sitemap',
  'nacelle-pushowl-nuxt-module'
],
```

Next you will have to add the PushOwl configuration options to `nuxt.config.js` in the `nacelle` config object. You will need your Shopify store's subdomain.

```
nacelle: {
  spaceID: process.env.NACELLE_SPACE_ID,
  token: process.env.NACELLE_GRAPHQL_TOKEN,
  gaID: process.env.NACELLE_GA_ID,
  fbID: process.env.NACELLE_FB_ID,
  pushowl: {
    subdomain: 'XXXX'
  }
},
```

## API

### To show a native browser prompt

```
 window.pushowl
  .trigger("showWidget", {
    type: "customPrompt",
  })
  .then((res) => {
    // Do anything you want to after showing prompt
  });
```

```
 window.pushowl
  .trigger("showWidget", {
    type: "customPrompt",
    title: "Lets get you offers!",
    description: "Subscribe to get amazing offers",
    yesButton: { label: "Subscribe" },
    noButton: { label: "Later" },
    logo: "image url here",
    position: { default: "top-left", mobile: "bottom" },
    overlay: { enabled: false },
  })
  .then((res) => {
    // Do anything you want to after showing prompt
  });
```
