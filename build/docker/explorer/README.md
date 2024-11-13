## Standalone Component Explorer

While the component explorer is primarily for development purposes, it can
be useful to deploy it so external parties can view the progress of components
being built.

This package defines the basic static Node server to serve the pre-built component
explorer and the `Dockerfile` which describes how the image should be cut.

See the `build/script/prep-explorer` script to see how this package is put
together with the compiled component explorer in preparation for building
the docker image.
