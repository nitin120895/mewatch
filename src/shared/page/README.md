### Pages & Content Rows

The app consumes page data from our Rocket API. Each page has a corresponding _**page template**_, and sometimes a _**page key**_ which defines an _aesthetic_ as well as enforcing their supported _**page entry templates**_, which are curated via Presentation Manager.

> Our pages are either _dynamic_ or _static_:

* **Static pages** have a predefined look and feel. They don't consume content rows from Rocket.
* **Dynamic pages** consume curatable content rows from Rocket (scheduled via Presentation Manager).

_An example of a static page is an account related page presenting a form. An example of a dynamic page is the homepage._

#### Static Pages

By default pages are assumed to be **static**. Static pages load their page **_summary_** data (no rows) from the **Sitemap** as part of the application startup process. _They're loaded once rather than on demand when routing to each page._

These typically use a shared `Static` page template and each have their own _**unique page key**_ which is used to differentiate them from other static pages.

### Dynamic Pages

In contrast **dynamic** pages load their page **_detail_** data (rows of page entries) on demand when routing to each page.

> To mark a page as Dynamic simply include its template within the `dynamicTemplates` Map within `shared/page/pageTemplate.ts`. This will ensure it requests its page detail data on demand.

There are many non static page templates predefined within the system. Some _may_ also have a _**unique page key**_ assigned.

#### Page Routing

**Because our app's routes are dynamic (_schedulable via Presentation Manager_) we split our routes based on page template or page key rather than page path.**

_Routes can be resolved via **either** a page key (see src/shared/page/pageKey.ts) or a page template (see src/shared/page/pageTemplate.ts):_
```
<Route getPath={path(template.Home, store)} ... />
<Route getPath={path(`@${key.Register}`, store)} ... />
```

During startup the app loads our **Sitemap** from Rocket which contains all of the allowed page paths for the current user (based on filters). Each of these paths has a corresponding _page template_ and sometimes a _page key_.

When a user navigates to a path the app looks for a matching pag key or template within the sitemap and if found presents the page. Routes are defined to resolve either a page key _or_ a page template.
Page keys are prefixed with an `@` to differentiate them from page templates within the app's routes definition.

The same applies for page entries within a page. Each page has a predefined set of _page entry templates_ (see src/shared/page/pageEntryTemplate.ts) which it's aware of. If a page schedules a row with a template it's unfamiliar with it will simply ignore and skip it.

> When server-side rendering is leveraged we embed the page entry data for the "above the fold" page entries. The remaining page entries are then lazy loaded in afterwards.

_To learn more about the wiring behind our path & template resolution please review the code within configPage.ts (see src/shared/page/configPage.tsx#76) and pageEntryWrapper.tsx (see src/shared/component/pageEntryWrapper.tsx)._

#### Code Splitting

Our [code splitting](https://webpack.js.org/guides/code-splitting/) is done per **page component**. For dynamic pages this means we need to declare the supported _page entry templates_ for each _page template_.

* If a page entry is used only on a single page type this means its code gets bundled together into that single entry point only.
* If a page entry template is supported on multiple page templates its code is bundled together into a shared chunk leveraged multiple times.

We also supply [`webpackChunkName` "Magic Comments"](https://medium.com/webpack/webpack-3-official-release-15fd2dd8f07b) to aid in the grouping of related pages.

> Because we're using [tree shaking](https://webpack.js.org/guides/tree-shaking/) it's imperative that we declare the correct page entry template components for each page otherwise they may be unexpectedly removed as part of the _dead code elimination_ process.

See **Mapping Page Entries** below to learn about the pattern we used to prevent this:

#### Creating a New Page

Pages are wrapped by our `configPage` (see src/shared/page/configPage.tsx) higher order component which is responsible for rendering the correct page content in an efficient way.

Each page should define its **template**, and if it's _static_ then it should also define its **key**.

```
import { TemplateName as template } from 'shared/page/pageTemplate';
import { PageKeyName as key } from 'shared/page/pageKey';

// ... CustomPageComponent definition ...

export default configPage(CustomPageComponent, { template, key });
```

#### Mapping Page Entries

To add support for your new page entry template (or to rename an existing one) you'll need to perform the following steps:

1. Within `shared/page/pageEntryTemplate.ts` you'll need to add a constant string value matching the template name.

    e.g. `export const AcmeHero3x1 = 'Acme Hero (3:1)';` where the string value matches the `entry.template` value returned from Rocket in the page's data.
    > _To avoid merge conflicts try and add your customer specific templates grouped together at the top or bottom of the file_.

1. For pages templates which only support a _couple_ of page entry templates you can add the entry template's constant directly within an array passed to `configPage`:
    ``` javascript
    import { CustomPage as template } from 'shared/page/pageTemplate';
    import AcmeHero3x1 from '../../pageEntry/AcmeHero3x1';
    
    ...
    // At the bottom of your CustomPage.tsx component
    export default configPage(CustomPage, [ AcmeHero ], { template });
    ```

1. Alternatively, since most page templates support _several_ page entry templates the following pattern is preferred:

    * Create a companion file next to your page component file called `${componentName}Entries.ts`.
    * Import all of the components which this page template supports then export them within an array e.g.
    
    ``` javascript
    import AcmeHero3x1 from '../../pageEntry/AcmeHero3x1';
    import AcmePosterRow from '../../pageEntry/AcmePosterRow';
    import AcmeFooBar from '../../pageEntry/AcmeFooBar';
    
    export default [
        AcmeHero3x1,
        AcmePosteRow,
        AcmeFooBar
    ];
    ```

    * Then import this companion file and pass its array into `configPage` e.g.

    ``` javascript
    // At the top of your CustomPage.tsx component
    import { CustomPage as template } from 'shared/page/pageTemplate';
    import entryRenderers from './customPageEntries';
    ...
    // At the bottom of your CustomPage.tsx component
    export default configPage(Home, entryRenderers, { template });
    ```

1. If your exported component name perfectly matches the name of the matching constant within `pageEntryTemplate.ts` then that's all you need to do.

1. If however your component name differs from the name of the matching constant within `pageEntryTemplate.ts` then you'll need to define the template's name within the component by setting an explicit `template` value e.g.

    ``` javascript
    import { AcmeHero3x1 as TemplateName } from 'shared/page/pageEntryTemplate';
    ...
    // Remapped template name
    (AcmeHero as any).template = TemplateName;

    export default AcmeHero;
    ```

    * _Obviously you'd need to update the import statements if your name differs like this_...

1. Your template is now mapped correctly and will be presented if/when its row type is scheduled within Presentation Manager for your environment (_and assuming its scheduled list isn't empty_).

1. Your page template's component will render it by calling the `renderEntries` method returned in the `PageProps` (_remembering it will be skipped if there isn't any data for it_).
