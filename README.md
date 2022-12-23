<p align="center">
  <img src="logo.svg" alt="Logo" width="150" height="auto" />
</p>

<h1 align="center">Stately Machine</h1>

<p align="center">
  <b>A Finite State Machine using Observables</b>
</p>

<br />

## Playground

See [Stackblitz](https://stackblitz.com/edit/stately-machine?devtoolsheight=100&file=index.ts) for an interactive demo.

## API Docs

See our [documentation website](https://appsweet-co.github.io/stately-machine/) for API docs.

## Error Types

See our [wiki](https://github.com/Appsweet-co/stately-machine/wiki/Error-Types) for details on all errors.

## Quick Start

Install using npm.

```zsh
npm i @appsweet-co/stately-machine
```

Import the class directly into your code.

```ts
import { StatelyMachine } from "@appsweet-co/stately-machine";
```

See [Stackblitz](https://stackblitz.com/edit/stately-machine?devtoolsheight=100&file=index.ts) for details on how to set up a new machine.

## More Info

Stately Machine is a Finite State Machine for TypeScript. It uses [Observables](https://rxjs.dev/) instead of callbacks to manage state events.

Use an Enum to [store states](https://stackblitz.com/edit/stately-machine?devtoolsheight=100&file=index.ts:L13-L18). We recommend [String Enums](https://www.typescriptlang.org/docs/handbook/enums.html#string-enums) for easy iteration using [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values).

You can also set an [optional context](https://stackblitz.com/edit/stately-machine?devtoolsheight=100&file=index.ts:L22-L27) made of any key-value pairs you need. Update and access the context as needed.

Stately Machine makes no assumptions about what you want to do when an error happens. You must subscribe to the error observables to get details about each error.

Stately Machine also makes no assumptions about what you want to do for a successful change in state. You must subscribe to the success observables to get details about each state change.
