# React Base Template

This is a base template for React projects. It includes:
- Vite.js as bundler
- React 18
- React Router
- Axios with:
  - Base URL already set
  - JWT token interceptor
- ESLint with:
  - Prettier
  - React
  - React hooks plugin
  - TypeScript
  - TailWind CSS
- SVG icons as React components
- SVG icons as URL

## How to use SVGs

### As React components

```jsx
import { ReactComponent as Icon } from './icon.svg';

const Component = () => (
  <Icon />
);
```
  
### As URL

#### Public folder
The `url` query parameter is used to import the SVG as a URL when the asset is located in the public folder (vite.js uses absolute import from root to referer to public folder).

```jsx
import iconUrl from '/icon.svg?url';

const Component = () => (
  <img src={iconUrl} />
);
```
  
#### Inside SRC folder
Just use a normal default import relative to the current file without the `url` query param (it can be used if you want it).

```jsx
import iconUrl from '../assets/icon.svg';

const Component = () => (
  <img src={iconUrl} />
);
```
  
## Scripts

### Development server
```bash
$ yarn dev
```

### Production build
```bash
$ yarn build
```

### Lint
```bash
$ yarn lint
```

### Fixing lint errors 
```bash
$ yarn lint:fix
```

## Environment variables

Vite doesn't use the `process.env.*` variables. Instead, it uses the `import.meta.env.*` variables. You can find more information [here](https://vitejs.dev/guide/env-and-mode.html).

### `.env` files

`.env` files are loaded in the following order:

```text
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

`mode` is the value of the `--mode` option when running `vite` or `vite build`. If not specified, it defaults to `development`. If you are using `vite serve` it will be `development` and if you are using `vite build` it will be `production`.
More information regarding `mode` can be found [here](https://vitejs.dev/guide/env-and-mode.html#modes).
