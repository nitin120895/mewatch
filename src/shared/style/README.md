## Styling & Appearance

This document describes various aspects and technologies around the Application's CSS.

### Preprocessor

The default selected pre-processor is [Node SASS](https://github.com/sass/node-sass).

* In __development__ mode stylesheets are injected as multple inline style elements within the `head`.
* In __production__ mode they are bundled together as a single file and loaded within a `link` element within the `head`.

You're welcome to use your own alternate solution such as [PostCSS](http://postcss.org/) or [LESS](http://lesscss.org/) by updating the webpack loaders within your webpack config.


#### Security

While you don't normally associate the word 'security' with CSS it can in fact impact it. If you have a **Content Security Policy** enabled for production builds and if you've _disabled inline styles_ you will need to make some considerations when authoring your components. See the [Considerations when authoring React Components](../../server/security/csp/README.md) section within the CSP documentation to learn more.


#### Concepts

Within this project we have three types of Sass files:

> A **partial** is a file that doesn't output it's own file.

These contain subsets of styling that are expected to be imported into another file.
Their filename's begin with an underscore '\_', however you omit the underscore within your import statements.

_In development builds partials won't output their own `<style></style>` block.
In production builds we bundle all of our CSS together into a single file making their special attribute redundant._

> A **module** is a file that doesn't output any code of its own.

These contain things like _variables_, _mixins_, and _functions_.

_Modules are always partials._

> A **stylesheet** is a file that does output code and a file.

These often import _modules_ to leverage variables and utils. The `*.scss` files you create for your components are stylesheets.


#### Documenting Styles

SASS supports single line comments and standard CSS block comments. For more info read the SASS reference guide [here](http://www.sass-lang.com/documentation/file.SASS_REFERENCE.html#comments).

* Block comments are _exported_ within the output stylesheet.
* Line comments are _stripped_ from output and don't appear in the output stylesheet.


#### Avoiding duplicate output

To prevent CSS duplication during compilation ensure that you're only importing partials that contain variables & settings and which don't ouput any CSS on their own.

We have exposed all of the current _modules_ inside a common environmental _partial_ so that you can leverage all of the variables and helpers via a single import in each of your Sass files.

Following this approach most of your components can import this single file:

``` scss
@import "shared/style/modules";
```

Additionally, we recommend using single line comments within _modules_ to ensure they don't accidentally output block comment blocks as CSS code.

### Convention

> We recommend using a combination of [SMACSS](https://smacss.com/book/), OOCSS, and the [BEM](http://getbem.com/) [naming convention](http://getbem.com/naming/) when defining your styles.

For more information about  mixing SASS with BEM see the below links:

* [csswizardry](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)
* [mattstauffer](https://mattstauffer.co/blog/organizing-css-oocss-smacss-and-bem#using-bem-in-sass)
* [css-tricks](https://css-tricks.com/the-sass-ampersand/#article-header-id-12)


### Performance

> **Please attempt to keep css [specificity](http://cssguidelin.es/#specificity) to a minimum!**

* Remember that browsers evaluate css [selectors](https://smacss.com/book/selectors) _right to left_.
* Minimise the number of selectors for each rule.
* Be mindful of your [_key_ selectors](http://csswizardry.com/2011/09/writing-efficient-css-selectors/#the-key-selector) (the right most selector in a rule).
* Avoid using _child_ & _sibling_ element/type selectors (e.g. `.component > div { }`) as they will match every element of that type on the page before being filtered down. Instead assign classes to the element(s).
* Never use the universal selector `*` as it's the most inefficient.

By default we enforce a moderate restriction by capping compound selectors via linting. If you'd like to tighten this further you can lower the following values within `stylelintrc.json` at the project root:

``` json
{
	"selector-max-compound-selectors": 4,
	"max-nesting-depth": 3
}
```

_Note that [`max-nesting-depth`](https://stylelint.io/user-guide/rules/max-nesting-depth/) should always be one less than [`selector-max-compound-selectors`](https://stylelint.io/user-guide/rules/selector-max-compound-selectors/) for consistent results._


### Writing scalable and maintainable CSS
This document highlights some important rules and tips for creating a scalable and maintainable CSS architecture so that the application does not suffer from CSS bloat after multiple development iterations: [8 simple rules for a robust, scalable CSS architecture](https://github.com/jareware/css-architecture/blob/master/README.md).


### Framework

[Base Guide](http://basegui.de/) is provided as a light weight CSS framework to aid in defining the look and feel of your application.
It is design unopinionated and comes with a minimal component & feature set to get you up and running fast.
It has a small footprint weighing _5Kb_ when gzipped.

It includes the following vendor libs:

* [normalize.css](https://necolas.github.io/normalize.css/) for providing a consistent rendering of common html elements cross browser.
* [sass-mq](http://sass-mq.github.io/sass-mq/) for providing media queries for responsive layouts.
* It also includes a simple [grid layout](https://github.com/slavanga/baseguide#flexbox) system using `flexbox` with `float` fallback for [legacy browsers](https://github.com/slavanga/baseguide#browser-support).

#### Replacing the Framework

The included framework was selected to serve as the basis to build upon, however should you wish to replace it with your own you can certainly do so.

> If you wish to maintain [normalize.css](https://necolas.github.io/normalize.css/) and [sass-mq](http://sass-mq.github.io/sass-mq/) you'll need to add them as direct dependencies instead.

In your own fork simply:

1. Remove `baseguide` from the dependencies within `package.json`.
1. Within `src/shared/style/main.scss` remove the framework's import statements: `@import "~baseguide/scss/*";`.
1. Within `src/shared/style/modules/_vendors.scss` remove the framework's import statements and documented variable overrides.
1. Within `src/shared/style/generic/_layout.scss` remove the framework's import statement: `@import "~baseguide/scss/baseguide/grid/classes";`.
1. With the file no longer referenced delete the framework variable overrides partial at `src/shared/style/vendor/_baseguide.scss`.
1. Supply your own replacement foundation framework or write your own from scatch.
1. Any components we provide which you don't need can simply be deleted from your forked repository.
1. Update any components that you're keeping which use baseguide styles with your new class names. A keyword search should suffice in finding all references.


### Structure

File structure is described below for both common and component based styling.

#### Shared Styles

Common styles exist witin `src/shared/style/`.

> All files stored here should be [_partials_](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#partials) (filename prefixed with an underscore).

Ideally each folder at this depth would have a single .scss partial file that collects the other files within in the same directory to allow easier importing.

> To [prevent code duplication](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#nested-import) when importing the same partial within several components, only import partials which don't output code.

| Path | Description | Note |
|------|------|------|
| `src/shared/style/modules/*.scss` | Contains app variables, mixins, functions, etc. | _Styles in here should NOT output any code!_ |
| `src/shared/style/_modules.scss` | Contains all of the files within the modules folder. | _Import this within your components to leverage all of the modules. This does not output any code._ |
| `src/shared/style/generic/*.scss` | Contains common & base styles. | _Styles in here DO output code. They should only be imported within main.scss_ |
| `src/shared/style/main.scss` | Contains all of our base styles from the generic folder as well as vendor styles. | _This file does output code. Import it only once!_ |


#### Target Component Styles

For convenience & visibility, styles related to components should exist next to their JS counterparts e.g.

```
src/company/target/component/CustomComponent.tsx
src/company/target/component/CustomComponent.scss
```

> The exception is for resuable styles shared across multiple components which should exist in `src/shared/style/generic/*.scss` or within [`shared-components.scss`](../component/README.md).

You can see an example of this below, or you can view the [Packshot component](./src/ref/responsive/component/Packshot.tsx) as a provided reference: 

``` jsx
import { Link } from 'react-router';

import './CustomComponent.scss';

const CustomComponent = (props: PageProps) =>
		<div className='custom-component'>
				<Link to="/">Foo</Link>
		</div>;

export default CustomComponent;
```

``` scss
@import "shared/style/modules";

.custom-component {
		background-color: $color__primary;
		&:hover {
				background-color: $color__primary--hover;
		}
}
```

#### Shared Component Styles

Shared components are target agnostic, however each target _may_ wish to style them differently.

To accommodate this and to minimise our CSS output filesize, concrete style implementations are to be defined per target.

See [here](../component/README.md) for more information.

#### Fonts & Images

Our loader chain requires `url(...)` loaded files such as fonts and images to be linked relative to our [`src/shared/style/main.scss`](./src/shared/style/main.scss) file.

e.g. `background: url("../../../resource/image/image.png");`

See the [sass-loader docs](https://github.com/jtangelder/sass-loader#problems-with-url) for more information.

#### Icons

We recommend the use of SVG iconography however we don't implement or enforce this so you're welcome to use Icon Fonts if you prefer.

Ensure you add an appropriate resource loader within your webpack config if you intend to load SVG files directly.

#### Responsive Breakpoints

Breakpoint media queries can be defined via [Sass MQ](http://sass-mq.github.io/sass-mq/). See [Adding Custom Breakpoints](https://github.com/sass-mq/sass-mq#adding-custom-breakpoints) for info & examples.

The use of media queries is safe since they're supported by our minimum browsers defined within the _Minimum Browser Support_ section of our main [README.md](../../../README.md#minimum-browser-support).

#### Responsive Grids

The grid system is based off the [bootstrap grid](https://getbootstrap.com/css/#grid) so you may already be familiar with it. If you're unfamiliar I suggest reading [this](https://medium.com/wdstack/how-the-bootstrap-grid-really-works-471d7a089cfc) as a good starting point.
