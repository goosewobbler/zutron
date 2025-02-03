<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./resources/zutron-readme-hero-dark.png"/>
  <source media="(prefers-color-scheme: light)" srcset="./resources/zutron-readme-hero-light.png"/>
  <img alt="reduxtron hero image" src="./resources/zutron-readme-hero-light.png"/>
</picture>

_streamlined electron state management_

<a href="https://www.npmjs.com/package/zutron" alt="NPM Version">
  <img src="https://img.shields.io/npm/v/zutron" /></a>
<a href="https://www.npmjs.com/package/zutron" alt="NPM Downloads">
  <img src="https://img.shields.io/npm/dw/zutron" /></a>

### Why

> tldr: I want to use Zustand in my Electron app, seamlessly

[Zustand](https://github.com/pmndrs/zustand) is a great state management library. As with other state libraries [such as Redux](https://redux.js.org/tutorials/fundamentals/part-4-store#redux-store), it is [recommended](https://zustand.docs.pmnd.rs/guides/flux-inspired-practice#recommended-patterns) that a single store is used in your app.

For Electron apps this is an awkward problem as you need access to the store in both the main and renderer processes.

Zutron enables a single store workflow with Zustand in Electron apps, effectively simplifying the use of Zustand in this context by abstracting away the necessary IPC and dispatch management.

### Features

- Use Zustand everywhere in your Electron app
- Single store workflow across the IPC boundary
- Works with the latest [Electron security recommendations](https://www.electronjs.org/docs/latest/tutorial/security#checklist-security-recommendations)
- Supports `BrowserWindow`, `BrowserView` and `WebContentsView`
- Integrates with windows and views created at runtime
- Compatible with the main Zustand usage patterns
- Handles thunks, inline actions or Redux-style action objects

### How It Works

Behind the scenes, Zutron creates an additional Zustand store in each renderer process. These stores are synchronized in one direction with your application store in the main process.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./resources/zutron-app-architecture-dark.png"/>
  <source media="(prefers-color-scheme: light)" srcset="./resources/zutron-app-architecture-light.png"/>
  <img alt="reduxtron hero image" src="./resources/zutron-app-architecture-light.png"/>
</picture>

Actions from the renderer process(es) are dispatched across IPC to the main process store, which handles them and updates the application state accordingly. Internally, the Zutron renderer process store(s) receive these state updates over IPC and update themselves accordingly.

#### Accessing Your Application Store

- Renderer process
  - Application state can be accessed via the Zutron `useStore` hook
  - Actions & thunks can be dispatched via the Zutron `useDispatch` hook
- Main process
  - Application state can be accessed directly in the [same way you normally use a vanilla Zustand store](https://github.com/pmndrs/zustand/blob/5d92ad2767e6a13d94331b5b62a44c069df2dfc6/readme.md#using-zustand-without-react):
    - Either using the Zustand vanilla API utilities: `getState`, `setState`, `subscribe`, `getInitialState`
    - Or via the Zustand `useStore` hook
  - Actions & thunks can be dispatched via the Zutron `dispatch` helper

### Getting Started

See the [docs](./docs/getting-started.md).

There are minimal example applications featuring three different Zustand usage patterns:

- [Redux-style reducers](./apps/example-reducers)
- [Separate handlers](./apps/example-separate-handlers)
- [Store-based handlers](./apps/example-store-handlers)

### Inspiration / Prior Art

This project would not exist without Reduxtron, shout out to vitordino for creating it!

- [vitordino/reduxtron](https://github.com/vitordino/reduxtron)

  - Redux store in the main process, optionally synced to Zustand in the renderer
  - Zutron is based on Reduxtron
  - Great for Redux users, not an option if you want to use Zustand everywhere

- [klarna/electron-redux](https://github.com/klarna/electron-redux)
  - Bi-directional sync between one Redux store in the main process, and another in the renderer
  - No longer maintained
  - I created [a fork](https://github.com/goosewobbler/electron-redux) to enable support for [electron >= 14](https://github.com/klarna/electron-redux/issues/317), however I won't be spending any more time on this approach
