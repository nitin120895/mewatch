# XBox

XBox apps can be packaged or hosted - by default we use the packaging approach to align with Tizen and webOS default behaviour, but a project should consider hosting the app as a URL.

XBox development normally requires to create a native package using Visual Studio, but it can be avoided:

## Cheap local development environment

You can avoid installing Windows and the SDKs by using an XBox shell app which can be produced by Bamboo.

Remote debugging will be a problem though. You can use a tool like [Weinre](1) or maybe [VorlonJS](2) to have some level of remote inspection, but for the real remote-debugging you will need the full set up.

[1]: https://people.apache.org/~pmuellr/weinre/docs/latest/Home.html
[2]: https://github.com/MicrosoftDX/Vorlonjs/

## Full local development environment

### SDK installation

If you have a Windows 10 computer or VM you can install:

- Visual Studio 2017 (Community or more): https://visualstudio.microsoft.com/vs/older-downloads/
  (don't forget to install support for UWP)
- Latest Windows 10 SDK: https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk

Note: Xbox ref will be upgraded to the new 2019 PWA method in the future.

### Packaging apps locally

From Visual Studio:

- Open the `.jsproj` produced by the build process under `bin/app/pub` in Visual Studio,
- In "Solution Explorer", right-click the project node ("MassiveAxisXBox"),
- and choose Store > Create App Package...
- Select "I want to create packages for sideloading", then "Next",
- Choose architecture "x64" only, leave other options by default (auto-increment, debug), then "Create",
- Once build is complete a link to the artefact will appear.

From command line:

- Ensure you have MSBuild in your PATH (it's installed by Visual Studio but not in the PATH),
- Open a command prompt and execute `build\script\package-xbox.cmd`

### Creating a Shell app for local development

When serving the XBox app from your machine it will have to be served from your IP.

For that you need to configure in `.env` (or command line):

- `HOST`: your machine IP in the network shared with the XBox (e.g. `10.1.2.3`),
- `HOSTED_URL` full URL to your Webpack dev server (e.g. http://10.1.2.3:9000)

Then start the dev server `yarn dev:xbox`, which will stub the XBox shell app under `bin/app/pub`. Using Visual Studio you can then build and run the shell app to run the app served live from your computer.

## Sideloading apps

Installing an application, either from CI or a local build, is called sideloading.

For that purpose the target device needs development mode and portal to be enabled:

- https://docs.microsoft.com/en-us/windows/uwp/xbox-apps/devkit-activation
- https://docs.microsoft.com/en-us/windows/uwp/debug-test-perf/device-portal

