# Nacelle PushOwl Nuxt Module

## Requirements

- A Nacelle project set up locally. See https://docs.getnacelle.com for getting started.
- **IMPORTANT**: Only Shopify store backend is supported currently.
- [PushOwl](https://pushowl.com) app installed on your Shopify store.

## PushOwl features available through this plugin

- Show prompts to collect subscribers ✅
- Automation: Welcome Notification ✅
- Automation: Abandoned Cart Recovery ✅
- Automation: Shipping Notifications ✅
- Automation: Browse Abandonment ❌
- Automation: Price Drop ❌
- Automation: Back in Stock ❌

Note: The unavailable features are coming soon!

## Setup

### 1. Install module

Once you have Nacelle and PushOwl set up you can install this module in your project from Github Packages through `npm` (or `yarn`):

Create a `.npmrc` file in your project and add the following line to scope `@pushowl` package to Github packages:

```
@pushowl:registry=https://npm.pkg.github.com
```

Then install the package itself:

```
npm install @pushowl/nacelle-nuxt-module --save
```

### 2. Add module to app

After the package has installed, open `nuxt.config.js`. Under `modules` add `@nacelle/nacelle-nuxt-module` to the array. It should look something like this:

```
modules: [
  '@nuxtjs/pwa',
  '@nuxtjs/dotenv',
  '@nacelle/nacelle-nuxt-module',
  '@nuxtjs/sitemap',
  '@pushowl/nacelle-nuxt-module'
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

### 3. Copy service worker file into the app

You need to copy a service worker file from this module's directory (`node_modules/@pushowl/nacelle-nuxt-module/lib/templates/service-worker.js`) into your app's `static` dir such that it is available on the path `/static/pushowl/service-worker.js`.

You can run the following set of commands from your root directory to copy the service worker file:

```
mkdir -p static/pushowl
cp node_modules/@pushowl/nacelle-nuxt-module/lib/templates/service-worker.js static/pushowl/
```

Now you are all set to use the API functions and trigger the prompts to ask for push notification permission.
Note: The SDK itself doesn't trigger any prompt. It's upto you to trigger it whenever you want.

## API

- There is a global object available called `pushowl` which can be accessed through `window.pushowl`.
- The API works by triggering appropriate **"actions"**. An action can be triggered like so: `window.pushowl.trigger(<action_name>, <options>)`. Eg. An action named "X" can be triggered through `window.pushowl.trigger("X")`

Available API actions:

### `showWidget`

**Options available**

- `type`: Type of widget to show. `browserPrompt`|`customPrompt`

For `customPrompt`, following extra options are available:

- `title`: Title for the prompt
- `description`: Description for the prompt
- `yesButton`: "yes" button refers to the positive/allow button in the prompt. This is an object with `label` property.
- `noButton`: "no" button refers to the negative/deny button in the prompt. This is an object with `label` property.
- `logo` _(optional)_: URL of the image to show as logo. Defaults to a bell if nothing is passed.
- `position` _(optional)_: Needs to be specified for desktop and mobile separately like so `position: {default: 'top-left', mobile: 'top'}`. Available options for desktop(default): `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`. Available options for mobile: `top`, `bottom`. Default is `{ default: 'top-center', mobile: 'top' }`
  `overlay` _(optional)_: Controls the overlay that shows with the native permission prompt. Only accepts one property for now: `enabled: true|false`. Eg. `overlay: { enabled: false }`
- `theme` _(optional)_: Allows changing various colors in the prompt. Currently supported properties are: `theme: { yesButtonBgColor: '#f00', yesButtonColor: '#fff' }`

### `syncCart`

Cart syncing is auto-enabled in this module. Nothing extra needs to be done to use PushOwl's Abandoned Cart Recovery feature. You just need to have it enabled from the PushOwl dashboard.

## Recipes

### To show a native browser prompt

```
if (Notification.permission === "default") {
  window.pushowl
    .trigger("showWidget", {
      type: "browserPrompt",
    })
    .then((res) => {
      // Do anything you want to after showing prompt
    });
}
```

Note, always check the current permission value before showing the prompt. `default` value means user has neither allowed nor denied.

### To show a Custom Prompt

```
if (Notification.permission === "default") {
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
}
```

Typically you can run the above code inside the router `onReady` event hook, so that the prompt shows when the app is ready. Refer next recipe.

### Show a custom prompt when app router is ready

You can put the following code in a new/exisiting plugin in your Nuxt app:

```
ctx.app.router.onReady(() => {
  if (Notification.permission === "default") {
    window.pushowl
      .trigger("showWidget", {
        type: "customPrompt",
        title: "Lets get you offers!",
        description: "Subscribe to get amazing offers",
        yesButton: { label: "Subscribe" },
        noButton: { label: "Later" },
        position: { default: "top-left", mobile: "bottom" },
        overlay: { enabled: false },
      })
      .then((res) => {
        console.log("PushOwl prompt shown", res);
      });
  }
});

```

### Show a native prompt 5 seconds after the app is open

```
setTimeout(() => {
  if (Notification.permission === "default") {
    window.pushowl
      .trigger("showWidget", {
        type: "browserPrompt",
      })
  }
}, 5000)
```
