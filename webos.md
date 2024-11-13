# WebOS development

## SDK

### Download & install SDK


You can safely pick the "minimal installer" option:
- http://webostv.developer.lge.com/sdk/installation/

### CLI Path

You should add `$WEBOS_CLI_HOME/bin` to the PATH:

- On Mac, you can edit `/etc/paths` to add it ot the default PATHs.
- On Windows, add the path to the System or User PATH.

Verify that the "ares" commands are available:

    ares -l

### Command Line Interface usage

- http://webostv.developer.lge.com/sdk/tools/using-webos-tv-cli/

---

## Configuration

### Link to TV

http://webostv.developer.lge.com/develop/app-test/

### Manifest

 **App Metadata Reference:**
- `http://webostv.developer.lge.com/develop/app-developer-guide/app-metadata/`

 **LG Resouce folder:**
- `resource/ref/tv/webos`

## Releasing

webOS TVs are usual Full HD (1080p), but low-end devices can be HD (720p)
so both resolutions should be delivered!

FHD devices can run HD apps just fine, but HD devices can't display FHD apps.

There are 2 ways to deliver a webOS app:
- packaged (like Tizen), where the IPK includes all the app assets,
- hosted app (like most other TVs), where there IPK only redirects to a static location.

We're using the latter for development, and depending on the project we can choose to release
the app using either ways, the latter being easy to update without a formal app upgrade.

### Packaged release

See:

```bash
yarn build:webos
```

### Hosted release

Environment should define (see `.env`):

- `HOSTED_URL` as the URL where the hosted app index is located,
- `WEBOS_HOSTED=true`

See:

```bash
yarn build:webos:hosted
```

## Packaging the IPK

```bash
# Packaged build
yarn package:webos

# Hosted build
yarn package:webos:hosted
```

This emits `bin/webos.ipk` which can be installed on your TV.

## Development

For development we're using the hosted approach (see Releasing section before),
where the IPK will point to our dev server.

Check your local IP address (`ipconfig` on Win, `ifconfig` on Mac) as the app has to
be accessible from the TV.

Set `HOSTED_URL` and `HOST` in your `.env` to the external URL that the dev server will expose:

    HOSTED_URL=http://<your IP>:9000
    HOST=<your IP>

Prepare the app wrapper:

```bash
# prepare bin/app/pub for development
# and create a stub app under bin/app/webos-ipk
yarn run dev:webos
```

Open a new terminal while the dev server is running,
and package and install the stub app:

```bash
# create IPK package
yarn run package:webos:hosted
```

## Installation and remote debugging

1. Run the right build/package task (see before) to obtain `bin/webos.ipk`

2. Run the command below to see the devices configured

        ares-setup-device -list

If the device has not been configured, follow this guide:
http://webostv.developer.lge.com/develop/app-test/

3. Verify that the device is connected (this lists installed apps, if any)

        ares-install --device <DeviceName> --list

4. Run this command to install the ipk file into the device:

        ares-install --device <DeviceName> bin/webos.ipk

5. You can start the app by this command:

        ares-launch --device <DeviceName> com.massive.axis.webos

6. If you want to start and remote-debug the app, run this command below:

        ares-inspect --device <DeviceName>  com.massive.axis.webos

Add `-o` to open automatically in the default browser.

## Tips

### Developer documentation

- Back button: http://webostv.developer.lge.com/develop/app-developer-guide/back-button/
- web api: http://webostv.developer.lge.com/api/web-api/supported-standard-web-api/
- Remote Control: http://webostv.developer.lge.com/develop/code-samples/remote-control/
- Virtual Keyboard: http://webostv.developer.lge.com/design/webos-tv-system-ui/virtual-keyboard/
- Device Unique ID: http://webostv.developer.lge.com/api/webos-service-api/device-unique-id/

### How to unpack an IPK

- On Windows use tools like 7zip or BandiZip
- On Mac/Linux, run `tar zxpvf package-name.ipk`

Inside the IPK, your app files are packed in `data.tar.gz`.
