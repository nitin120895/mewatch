# Certificates and security

## Tizen

Tizen has fine grained signing options where you must provide different identities (`.p12`):

- Author - Massive for dev/test, client for release,
- and Distributor - which defines the APIs available for the app.

### Documentation

- [Understanding Tizen Certificates & Package Signing](https://wiki.massiveinteractive.com/pages/viewpage.action?pageId=56694196)
  (Massive wiki)
- [Samsung official documentation about signing](https://developer.tizen.org/development/training/web-application/understanding-tizen-programming/application-signing-and-certificates)
  (external)

### Identitites

Reference application includes:

- a default Massive Author identity, `tizen/massive.p12`,
- Tizen default Distributor identity, `tizen/distributor.p12`.

The default identity is sufficient for creating a packaged app in CI and share with testers,
but for development (and hosted apps in general) you will want a Partner-level capable
identity (see WIKI link).

When you receive the client's Author `p12` and password, you should include the `p12` file
along with the other keys, and provide the password as a Bamboo `TIZEN_CLIENT_PASSWORD` variable
(see `bamboo.yml`).
