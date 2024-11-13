# Tizen development

## Official Tizen IDE (not recommended)

You can try to set your development environment using the latest Tizen Studio IDE and tools.
This is very tedious and large, and only sometimes works with great effort:

- https://developer.tizen.org/development/tizen-studio

**Exception:**
You may need to create a new Author and Distributor identity, in order to be able to debug
hosted apps on a new or personal device. In this case you can install only:

- Certificate Manager,
- Samsung Certificate Extension.

See `resource/certs/certificates.md` for instructions.

## Massive tizentool

Massive has developed `tizentool`, a proprietary CLI tool allowing to
create/sign/install/debug Tizen WGT packages without any official SDK.

`tizentool` is included in this project:

```
yarn tizentool <command>
```

## TV configuration

### Developer mode

- On the TV, navigate to Apps section and press successively
`1`, `2`, `3`, `4`, `5` on the remote,
- A developer mode dialog should appear:
    - Toggle developer mode to ON,
    - Enter **your** computer IP,
    - Restart the TV if it wasn't already in developer mode when starting.
- If the dialog doesn't appear make sure you're connected with a
Samsung developer account (see Smart section of TV settings).

Mac OS WIFI hotspot tip: when using the hotspot the developer mode IP will be different
than your usual LAN IP; it should be like `192.168.2.1` so verify the `inet` IP for
the Bridge connection using `ifconfig`.

## Packaging and Installation

### Packaging

Tizen apps packages need to be signed with an appropriate identity.
See `resource/certs/certificates.md` for information.

Like webOS, Tizen apps can be delivered as "hosted apps".
During development we typically leverage hosted mode.

Static build and local packaging:

```bash
# build application statically in bin/app/pub
yarn build:tizen
# package WGT as bin/tizen.wgt
yarn package:tizen
```

This should work OOTB and be possible to install on the TV straight away.

### Installation

With a TV configured for development (see earlier), you need to know the TV IP.

```bash
# install only
yarn tizentool <TV IP> install bin/tizen.wgt
# install and run
yarn tizentool <TV IP> run bin/tizen.wgt
```

Note: Samsung TV protocol is flaky and can fail for random reasons,
if the storage is full, or just because it "doesn't like" the app ID.

## Releasing

Tizen are delivered as Full HD (1080p) apps only.

Tizen apps are usually released as packaged apps, but it is possible to
create a hosted application, which is particularly useful for development,
but require special partner certification to be released to production:

## Development

Set the correct `HOSTED_URL` and `HOST` in your `.env`, with the same IP you've set for the
developer mode setup:

    HOSTED_URL=http://<your IP>:9000/
    HOST=<your IP>

Build for dev normally:

```bash
# prepare bin/app/pub for development
# and create a stub app under bin/app/tizen-wgt
yarn dev:tizen
```

Open a new terminal while the dev server is running,
and package and install the stub app:

```bash
yarn package:tizen:hosted
yarn tizentool <TV IP> run bin/tizen.wgt
```

Tips:

- Stub app only needs to be re-generated if your IP changes,
- You don't need to wait for the build to complete to package the stub app,
- Re-install the stub WGT to reset the app in case of problem on the device.

## Remote debugging

It is possible to remote-debug a Tizen application, and it's easy with `tizentool`:

```bash
yarn tizentool <TV IP> debug bin/tizen.wgt
```

The command will print out the URL to open in your web browser to access to the
remote debugger UI.

## Tips

### How to unpack a WGT

Either manually rename the `.wgt` to `.zip` and unzip normally.

Or use `tizentool` to unpack/pack/re-sign WGT files.
