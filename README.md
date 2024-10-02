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

> tldr: I want to use Zustand with Electron, seamlessly

[Zustand](https://github.com/pmndrs/zustand) is a great unopinionated state management library. As with other state libraries such as Redux, it is recommended that a single store is used.

For Electron apps this is an awkward problem as you need access to the store in both the main and renderer processes.

Zutron enables a single store workflow with Zustand in Electron apps, effectively simplifying the use of Zustand in this context by abstracting away the necessary IPC and dispatch management.

### How It Works

Zutron actually uses two stores, one on each process, with a one way sync from the main process to the renderer.

Actions from the renderer process are dispatched across IPC to the main process store, which handles them and updates state accordingly. The renderer store then receives these state updates over IPC and updates itself accordingly.

#### Accessing The Store

- Renderer process
  - Store access is via the `useStore` hook
  - Events & thunks can be dispatched via the `useDispatch` hook
- Main process
  - The store and its handlers can be accessed directly
  - Events & thunks can be dispatched via a custom helper

### Getting Started

See the [docs](./docs/getting-started.md).

There are minimal example applications featuring three different usage patterns:

- [Redux-style reducers](./apps/example-reducers)
- [Separate handlers](./apps/example-separate-handlers)
- [Store-based handlers](./apps/example-store-handlers)

### Inspiration / Prior Art

This project would not exist without Reduxtron, shout out to vitordino for creating it!

- [vitordino/reduxtron](https://github.com/vitordino/reduxtron)

  - Redux store in the main process, optionally synced to Zustand in the renderer
  - Zutron is based on Reduxtron
  - Great for Redux users, not an option if you want to leverage all the benefits of Zustand

- [klarna/electron-redux](https://github.com/klarna/electron-redux)
  - Bi-directional sync between one Redux store in the main process, and another in the renderer
  - No longer maintained
  - I created [a fork](https://github.com/goosewobbler/electron-redux) to enable support for [electron >= 14](https://github.com/klarna/electron-redux/issues/317), however I won't be spending any more time on this approach
