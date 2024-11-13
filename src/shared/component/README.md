### Styling of Shared Components

> Common shared components should **_not_** be design opinionated.

Components inside this package should **_not_** provide any styles directly.
The caveat to this is that some components may require a certain level of styling in order to function correctly.

> Each target is expected to provide their own styles for whichever shared components they use.

#### Target Specific Styling

Regular components import their `*.scss` file inside their class. This has the advantage of using the same shared styles
reference for each instance of the component, which avoids duplicated CSS output.

Shared components should inherit their styling via a top level file which will live inside each _target_ package.

To avoid outputting duplicated CSS the [`shared-components.scss`](../../ref/responsive/shared-components.tsx) file should be imported only _once_ within your target's [`index.tsx`](../../ref/responsive/index.tsx) file.

#### Writing Shared Components

If your shared component requires styling in order to function correctly you must provide a concrete styling implementation within your target of choice.

Then ensure you document that it requires styling by adding a comment towards the top of the file. Reference your concrete implementation e.g.

``` javascript
/**
 * This component requires styling to function correctly.
 * 
 * For an example of its styles see: `src/ref/responsive/shared-components.scss`
 */
```

#### Using Shared Components

Verify whether your selected component requires styling by looking for the above comment block towards the top of the file.
If it needs styling, confirm whether the necessary styles exist within your target's `shared-components.scss` file. If they don't you'll need to add some.

> Do **_not_** import the shared component styles again every time you use a shared component as this would result in outputting duplicate styles.

#### Overridding Styles

In some situations you may wish to use the styling defined within `shared-components.scss` for the majority of your component instances, but provide alternate styling for a particular situation.

For this we leverage the _cascading_ nature of CSS at runtime and simply provide new styles with a _higher specificity_ to allow us to augment or replace the default styling.

These styles would be defined within a stylesheet referecnes by your target components. This is the same pattern used for styling regular comments.
