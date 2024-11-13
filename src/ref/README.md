## Reference Apps & Forking Strategy

Reference apps are included within `src/ref/`.

The reference apps are supplied as examples and guidelines following industry best practices.

When forking you're expected to create your own company folder within the `src`
package e.g. `src/acme/` for a company named Acme.

Inside you add each of your device targets (e.g. `responsive` and/or `tv`).

This separation of code between the reference code and your project code helps mitigate merge conflicts
when up-merging the latest changes from the axis-web project back into your fork.

You'll notice the _ref_ package contains a _responsive_ target. This uses css media queries to adaptively
respond to varying dimensions and supports mobile, tablet, and desktop within a single target.
_You're encouraged to do the same with your project_.

You're free to use and modify any code/components from within the `src/ref/` package, however
it's recommended that you copy the files under ref targets into your own folder (e.g. `src/acme`)
rather than use them directly in order to avoid merge conflicts and unexpected functional changes
which may occur in future updates to the reference apps. As the name implies, these are _reference_ applications.

The same pattern has been used within the _component viewer_. Read through its [documentation](../viewer/README.md) for additional changes.

#### Import Statements

The project is configured to support relative and absolute paths with your classes. We follow the current pattern:

* Code which is self-contained within a top level package inside the `src` folder use **relative paths**:
    _e.g. `import Foo from '../component/Foo';`, `@import "./foo";`_
    > Relative paths must start with a dot slash; either `./` or `../`.

* Code which is referenced outside of the app's company folder use **absolute paths**:
    _e.g. `import Bar from 'shared/component/Bar';`, `@import "shared/style/bar";`_
    > Absolute paths should **not** start with a slash.

* Code which is referenced within `node_modules` use paths relative to the library:
    _e.g. `import Baz from 'lib';`, `@import "~lib/styles"` These both resolve to `node_modules/lib/**`_

> Within the reference app this means we use absolute paths when referencing code within `src/shared/**` and also within `src/viewer/**` for any references to code in either `shared` or your company package (e.g. `ref`).

One **caveat** to using _absolute paths_ in your Javascript files is that if your top level package name is identical to a library name within `node_modules` then they will conflict with each other and you won't be able to reference your files correctly since libs are resolved first. This is overcome for stylesheets by using the tilde `~` character as a _prefix_ before the library name.


### Module replacement

If you want to change a deeply integrated component (e.g. `Packshot`, `PackshotList`, etc), or simply adjust a component's
styling without copying the entire component structure then you can use module replacement.

With this technique you can override the import path so webpack/typeScript will load your component instead of the original one.

It is working with both TSX and SCSS modules, and you can configure them from the `tsconfig`

#### When should you use it?

- If you need to change a nested component without changing its ancestor component(s) (e.g. `Packshot`, `EntityTitle`).
- if you want to adjust a component's styling without changing the component structure.

_This solution is *NOT* a silver bullet, please use it wisely. It won't help under the following conditions:_

 - if you have to change a rarely or only once used component (navigation components, account page, etc.)
 - when you have to replace the the whole component structure and not just a nested one
 - when the new component props are not compatible with the original one

#### How you can use it

Open `tsconfig.json` and add your replacement mapping(s):

```json
	{
		"compilerOptions": {
			...
			"paths": {
				/* typescript (without extension) */
				"shared/component/Image": ["acme/responsive/component/Image"],
				/* scss or image file (with extension) */
				"ref/responsive/component/EntryTitle.scss": ["acme/responsive/component/EntryTitle.scss"],
				/* scss module (normalised without `_` or extension) */
				"ref/tv/style/modules": ["acme/tv/style/modules"],
				...
			}
		}
	}
```

**Note**:

 - Please use the the full path (relative to the `tsconfig` `basePath`) without extension,
 - Please always use only one to one mapping (TS can handle one to many, but we do not need it),
 - For SCSS replacement please use the normalised filename format (without `_` prefix and `.scss` postfix)
   ex: `ref/tv/style/modules` instead of `ref/tv/style/_modules.scss`
- Platform-specific replacements are defined separately in `build/webpack/vendor/platform-replacements.js`

#### How does this work?

TypeScript and SCSS module replacement using two separated approach. In TypeScript case Webpack will handle all of the imports so we can use the build in utilities (see next paragraph),
this also works for component styles, because we load them from the code. In the other hand the scss (`@import`) resolved by node-sass compiler.
The Webpack config automatically reads the `tsconfig` you we can add all of your rules to **within** the TS config.

**TypeScript**

We must resolve the replaced modules within both TypeScript and Webpack.

Read about [TypeScript Module resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html) and about [Webpack NormalModuleReplacementPlugin](https://webpack.js.org/plugins/normal-module-replacement-plugin/) to learn more.

Internally we are using a custom Webpack plugin: `build/webpack/plugin/MassModuleReplacementPlugin.js`

**SCSS**

We use the Node-sass for SCSS compilation and it has an extra parameter for module replacement.

Read about [Node-sass importer](https://github.com/sass/node-sass#importer--v200---experimental)

##### Styling

For custom styling the easiest way if you use the SCSS module replacement, especially for TVs.

Add the next line to the `tsconfig.json`

    "ref/tv/style/modules": ["acme/tv/style/modules"]

Do not forget to update the project name.

## Product Team Coding Conventions

While our linting profile will enforce many of our coding conventions, the following should also be adhered to.

#### Components

When creating components we declare our imports, variables, and methods in the following order:

1. Javascript import(s)
1. Stylesheet import(s)
1. React Props & State Interface(s)
1. Class definition
	1. Static property definitions
	1. Private property definitions
	1. Constructor (optional)
	1. React lifecycle methods (in the order defined [here](https://facebook.github.io/react/docs/react-component.html#reference))
	1. Private utility functions or externally accessible public functions
	1. Event handler methods (declared as private arrow functions)
	1. Primary render function
	1. Secondary render functions (declared as private)
1. Exports with HOC (optional)

```typescript
// Javascript Import Statements
import Foo from './Foo';
import Bar from 'shared/util/Bar';

// CSS Import Statements
import 'Baz.scss';

// React PropTypes Definition
interface BazProps extends React.Props<any> {
	label: string; // Mandatory prop
	loading?: boolean; // Optional prop
}

// Class Definition
export default class Baz extends React.Component<BazProps, any> {
	static defaultProps = {
		label: 'Hello World'
		loading: true
	};

	// Private properties
	private element: HTMLElement;

	// Optional Constructor (if it doesn't perform any logic as is the case here)
	constructor(props) {
		super(props);
	}

	// React Lifecycle Methods
	componentDidMount() {
		// ...
	}

	componentWillUnmount() {
		// ...
	}

	// Event Handlers - should be arrow functions for automatic scope binding
	private onReference = (node) => {
		this.element = node;
	}

	private onClick = (e) => {
		// ...
	}

	// Primary render method
	render() {
		const { loading, label } = this.props;
		if (loading) return this.renderLoading();
		return (
			<div onReference={this.onReference}>
				<span onClick={this.onClick}>`Baz: ${label}`</span>
			</div>
		);
	}

	// Secondary render methods
	private renderLoading() {
		return <span>Baz: Loading</span>;
	}
}

// Optional alternate exports
// export default hocWrapper(Baz);
```
