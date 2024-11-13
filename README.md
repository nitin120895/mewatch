## Development

Ensure you have the latest Node v12.

You can use [nvm](https://github.com/nvm-sh/nvm) to manage the node version.

Install node version 12.22.4

    nvm install 12.22.4

Alias the node version for mewatch

    nvm alias mewatch_node 12.22.4

Use the node version for mewatch

    nvm use mewatch_node

For installing dependencies we use [Yarn](https://yarnpkg.com/). It has performance
improvements over npm which helps our CI build times. It also locks down lib versions more
intuitively that npm shrinkwrap.

To install yarn for your platform see [here](https://yarnpkg.com/en/docs/install).
You can also install via npm if you like.

    npm install yarn --global

Once you have `yarn` installed, install all required dependencies via.

    yarn install // or just `yarn`

Note for any of the npm run scripts listed below you are free to replace `npm` with `yarn`.

To run in dev mode with hot reload dev server.

    # RW
    export PORT=3000
    npm run dev

    # TV (see `tv.md`)
    npm run dev:tv

Then go to http://localhost:3000

You can then edit any of the client code for those changes to be reflected in the browser.

### Codegen

Whenever there is a Rocket API change, we need to run codegen to sync up the API data models. Refer to steps [here](https://mediacorp.atlassian.net/wiki/spaces/togeng/pages/3484876860/Codegen).

### Environment Variables

Once installation of dependencies has run, a post install hook will copy the file `.env-sample`
to `.env` (assuming a `.env` file doesn't exist). Here you are free to edit environemnt variables
for the environment you're developing against. **The .env file should never be committed**.

Details of why we use environment variables [here](https://12factor.net/config).

### Bundle size optimisation

Developers are responsible for being careful and thoughtful about the JavaScript payload:

- ensure routes are lazy-loaded,
- consider lazy loading of individual JS-heavy features (for instance a 3rd party player),
- don't add new npm modules without considering their impact (eight and dependencies),
- inspect the bundles size regularly!

Building with the `BundleAnalyzerPlugin` will produce a `bin/report` where you can inspect the bundles and their content:

    ANALYZER=true yarn build:static

## Reference Apps & Forking Strategy

To learn about the reference apps and our forking strategy read the [**Reference Apps & Forking Strategy**](./src/ref/README.md) documentation. It outlines the changes you'll need to make when forking for a new project, and defines the Product team's coding conventions when contributing to the Reference Apps.

### Customising Pages & Content Rows

To learn about how the app consumes pages and rows read the [**Pages & Content Rows**](./src/shared/page/README.md) documentation. It describes our code splitting and tree shaking strategy which will impact how you build out your components.

## Testing

To run all tests.

    npm test

To run tests in watch mode.

    npm run test:watch

In watch mode tests will run incrementally, so after initial execution, only tests which
change will run.

We're using [Jest](https://facebook.github.io/jest) for its great React support and speed.

On top of Jest we use the [mocha test framework](http://mochajs.org/) for its simplicity and popularity.

[Chai](http://chaijs.com) we use for assertions due to its rich and flexible syntax.

Finally to help test React components we use [Enzyme](https://github.com/airbnb/enzyme).

You're free to use any assertion or mocking frameworks your team prefers.

### Component Viewer

You can utilise the included **Component Viewer** to view and test your responsive components in isolation.
Read through the [Getting Started with the Component Viewer](./src/viewer/README.md) guide for setup information and to learn more about it's advantages.

By default the **Component Viewer** is part of the QA build process, but some project disabled it because it not used.
You can disable it if you remove the `--env.viewer` parameter from end of the `build:qa` command in the `package.json`

_Note_:

- Component Viewer can slow down the QA build
- QA build can fail because of duplicated module loads if viewer load customised component which not part of the module replacement.
  please run `build:qa` locally first and fix the issues

## Production

### Building

To create a production build.

    npm run build

If you want to build the static version of the app (i.e. precompiled index page)

    npm run build:static

### Running

After building, you can serve the production build locally via.

    npm run server

Then go to http://localhost:9001

Alternativly to build and run in one.

    npm run prod

or

    npm run prod:static

### Docker

When we deploy to our AWS environents we do so by cutting a [Docker](https://www.docker.com) image
of our web app.

We also use an [Nginx](https://nginx.org) Docker container to load balance N web app containers per host.

Through the power of Docker and docker compose its trival to run this setup locally.

First install [Docker](https://docs.docker.com/engine/installation) if you're not already.

Change port number `9001` to `3000` in `docker-compose.yml`, `taskdef.json`, `Dockerfile`, `nginx.conf` if you are running docker in your local machine. This is overcome the CORS errors from AXIS apis.

Then prep the release

    npm run prep:release

CD into the to docker bin folder

    cd bin/docker

And now use docker compose to build your cluster

    docker-compose build

To run

    docker-compose up

You can then access the web app via http://localhost:9001 or http://localhost:3000 if you have changed the port number as mentioned above.

And to stop the cluster

    docker-compose stop

## Internationalisation

The default locale is defined by the `CLIENT_DEFAULT_LOCALE` environment variable (defaults to `en`).
Extra locales can be included by adding locale codes to the comma delimited `CLIENT_LOCALES`
variable e.g. `en,fr`. Locale codes may also include regions e.g. `en-AU`.
See https://npmcdn.com/react-intl@2.1.3/locale-data/ for a list of locale codes.

For each locale you enable you must provide a `resource/strings/strings-<locale>.json` or
`resource/strings/strings-<locale>-<region>.json` file which contains all in-app lables for
the given language.

Refer to the [**Locale Strings Documentation**](./resource/ref/string/README.md) to learn more string bundles.

All required locale modules and strings json files are bundled at compile time. The strings json
file(s) for the default/selected locale will be loaded at runtime on demand.

For further details on usage in app see [react-intl](https://github.com/yahoo/react-intl/wiki).

## Tools

The following are recommended Chrome plugins to assist development.

- [Chrome React Dev Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
  Inspect the React component tree and view component state and props.
- [Chrome Redux Dev Tools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
  Provides insight into your Redux state and dispatched actions.
- [Chrome React Peformance Tools](https://chrome.google.com/webstore/detail/react-perf/hacmcodfllhbnekmghgdlplbdnahmhmm)
  Start and stop the react-addons-perf profiler and view profiling results. _Note that this will only work in dev mode_.
  See React tips below for more information on React performance profiling.

## Tips

### Redux

Avoid using classes for defining objects in state, instead use TypeScript interfaces to type plain old
JavaScript objects. Failing to do this can make serializations of state (think server side rendering or
saving to/from disk) difficult.

Further to that, avoid putting anything that does not serialize to/from JSON into Redux app state.

[Official Redux FAQ](http://redux.js.org/docs/FAQ.html).

### React

Use [stateless functional components](https://facebook.github.io/react/docs/reusable-components.html#stateless-functions)
by default. Only use class based components where you need to manage internal component
state, e.g. a managed form component or container component feeding leaf components.

Doing this:

1. Makes it very easy to spot which components have state.
2. Makes components easier to read as less bloat.
3. Helps to think before adding state to components which don't need it.

Guides to debugging performance issues in React using `react-addons-perf`.

- [Performance Engineering with React](http://benchling.engineering/performance-engineering-with-react)
- [A Deep Dive into React Perf Debugging](http://benchling.engineering/deep-dive-react-perf-debugging)

### Typescript

#### Typings

When you install a new library dependency from NPM, you'll also want to install its typings.
These can usually be found in [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
and installed via [typings](https://github.com/typings/typings).

    typings install dt~<lib-name> --save --global

When running this command keep an eye out for dependencies being stripped. Basically if one
typing has a dependency on another lib's typings, they are stripped during installing so
you then need to manually install each yourself (and each of those may have typings stripped).

Another thing to keep in mind is that typings may be out of date or not exist. In those cases
you'll need to either create patch to the typings or (re)write them.

You should add your own custom typings within `typings/custom/`. e.g. `typings/custom/lib-name/index.d.ts`.

#### Named arrow functions

Arrow functions assigned to a variable do not get given that variables name during transpilation
by TypeScript.

This is a bug. See https://github.com/Microsoft/TypeScript/issues/6757

    const View = () => <div></div>
    console.log(View.name); // undefined instead of 'View' in all browsers except in chrome 50+

This means stack traces can be pretty terrible. It's recommended to use classic `functions`
where it makes sense to until this is fixed.

## Appearance

Documentation for the app styling can be found [`./src/shared/style/README.md`](./src/shared/style/README.md).

## Minimum Browser Support

> **_TL;DR_**: _IE9+_ for Desktop.

We can start with the baseline provided by **React 15**. React doesn't specify which browsers it supports but it does note that IE9 is the [minimum](<(https://facebook.github.io/react/docs/working-with-the-browser.html#browser-support)>) for Internet Explorer. Other browsers either [support ES5](http://caniuse.com/#feat=es5) natively or can be polyfilled to do so.

Since this is a [VOD](https://en.wikipedia.org/wiki/Video_on_demand) app we can also use [HTML5 Video](http://caniuse.com/#search=video) as a minimum requirement for AXIS apps, which coincides with React's minimum.
The included CSS framework maintains and [supports](https://github.com/slavanga/baseguide#browser-support) this same baseline.

**Depending on project requirements individual feature support for HTML5 & CSS3 may raise the bar and restrict this further.**

Common influencing features are DRM video, and the use of [flexbox](http://caniuse.com/#feat=flexbox) layouts.

_When choosing modern feature-sets consider the prevalance of legacy browsers/devices within emerging markets if this applies to your project._

#### Polyfills

Several polyfills / shims are provided by default for backwards compatibility within legacy browsers.

These are defined within `build/webpack/vendor/`. See [`shims-es6.js`](./build/webpack/vendor/shims-es6.js) and [`shims-dom.js`](./build/webpack/vendor/shims-es6.js).

## Optional Progressive Enhancements & Optimisations

Below are some additional features you may wish to leverage within your project. _These are not enabled by default._

### Responsive Images

Responsive images can be achieved in various ways. Images can be provided at varying widths, pixel densities, and formats.

#### Picture Component

The [`Picture`](./src/shared/component/Picture.tsx) component is provided for use with responsive images. It uses the [HTML5 Picture Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture).
If you utilise this within your components you should add the picturefill polyfill for legacy browsers.

> If you use this component it's recommended to add the [picturefill](http://scottjehl.github.io/picturefill/) polyfill.

#### Image Component

The [`Image`](./src/shared/component/Image.tsx) component is provided for use with regular & responsive images. It uses the standard [HTML Image Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img).
It can optionally accept a [srcset](http://caniuse.com/#search=srcset) value for responsive images.

> No polyfill is required when using Image as legacy browsers will automatically fall back to using the standard src attribute's value if multiple were provided.

#### Client Hints (HTTP Headers)

Although [not widely supported](http://caniuse.com/#feat=client-hints-dpr-width-viewport) yet, client hints can be enabled within your site by adding a meta element within your HTML template e.g.

```html
<head>
	...
	<meta http-equiv="Accept-CH" content="DPR, Viewport-Width, Width" />
	...
</head>
```

- In the above example the **Device Pixel Ratio**, and **Viewport Width** information is made available to the server.
- For image resources, if the `sizes` attribute was used then the **Image's Width** is also sent.

_This is potentially useful for server-side rendering, or for automatically serving responsive images or optimised formats, without the need for additional markup._

> Note that enabling this means additional data is added to each resource request, so there's no point enabling it unless your server will use the information.

For more information there is a good overview at [smashing magazine](https://www.smashingmagazine.com/2016/01/leaner-responsive-images-client-hints/), and a write up around utilising this additional header info within the server [here](http://robinosborne.co.uk/2016/02/02/client-hints-in-action/).
