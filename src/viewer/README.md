## [Component Viewer](https://wiki.massiveinteractive.com/display/MASV/Epic%3A+Component+Browser)

#### Getting Started

The component browser is included within **CI builds** and can be leveraged during **local development**.

To run it locally with hot module reloading simply run either of the following commands:

    npm run dev:components
    yarn run dev:components

You can view the component viewer at the following URLs:

[http://localhost:9000/components.html](http://localhost:9000/components.html)

#### Advantages

During development we need a way to view components in isolation using mocked data to prove functionality and layout.

As the component browser gets fleshed out with components it becomes a useful resource for:

1. Discoverability of available components & their configuration options for all team members and clients.
2. Aiding the QA testing process by allowing testing in isolation.
3. Aiding in the client approval purposes when signing off new designs or functionality.

#### Breakpoints and Media Queries

It's the responsibility of the developers to keep the breakpoint definitions in sync when adding/changing/removing breakpoints per project.

You can edit the breakpoints at [`src/viewer/company/breakpoints.ts`](./ref/breakpoints.ts).

The viewer UI provides icons to toggle between the different breakpoints used by the main project, as well as a width range slider to resize the viewport within the range of the current breakpoint.

## Reference Apps & Forking Strategy

Pages containing components used by the reference apps are included within `src/viewer/ref/`.

You're welcome to keep and use any of these, or you can replace them entirely with your own set of pages.

When forking you're expected to create your own company folder within the `src/viewer` 
package e.g. `src/viewer/acme/` for a company named Acme. _This will house your component pages_.

Create your own Routes file to point at your project's component pages.

- You can follow the reference example at [`src/viewer/ref/routes.ts`](./ref/routes.ts).

Create your own Breakpoints file at match your project's media queries.

- You can follow the reference example at [`src/viewer/ref/breakpoints.ts`](./ref/breakpoints.ts).

### Fork Code Changes

There are a few cide changes you need to make once you've forked.

Inside both `src/viewer/Page.tsx` and `src/viewer/index-iframe.tsx` update the following import statement to point at your own routes:

    import routes from './ref/routes';
    
Inside `src/viewer/ui/SideNavigation.tsx` update the following import statement to point at your own routes:

    import routes from '../ref/routes';

Inside both `src/viewer/ui/BreakpointSelector.tsx` and `src/viewer/ui/ViewportMetadata.tsx` update the following import statement to point at your own breakpoints definition:

    import { Breakpoints, BreakpointMap } from '../ref/breakpoints';

Inside `src/viewer/ui/BreakpointRangeControl.tsx` update the following import statement to point at your own breakpoints definition:

    import { BreakpointMap } from '../ref/breakpoints';

#### Technical breakdown

To achieve accurate breakpoint testing the component pages are rendered within an iFrame which has its own adjustable viewport compared to the browser window housing the component viewer.

It uses it's own Webpack Entry Points to split the code between the component viewer app and the internal component pages driving the iFrame content.

Routing is via React Router just like the main application except that we're using hash paths to allow simultaneous hosting of this and the main app on the same server.

A single React Router instance exists within the iFrame Page, however the hash paths are mimicked into the parent window to allow deep linking.

#### Issues

The routes use the `ReactRouter.RouteConfig` JSON syntax instead of JSX so that they can be consumed by both React Router and the shell app to drive the side navigation.

Because we're consuming this file in both the shell app and the iframe app the Component references unfortunately get compiled into the shell app unnecessarily.
This is acceptable for now considering this is an internal convenience tool and won't be used in production. We should look at preventing this in the future as the component pages are built out and as this tool grows in size.
