# Tizentool v4

CLI tool, and Electron app, for deployment and debugging of Tizen packages *without* Tizen Studio/SDK

## Download

- [CLI v4](https://www.dropbox.com/s/no3ch38jqs9qc7d/tizentool-v4.zip?dl=1)
- [Mac app v1](https://www.dropbox.com/s/mf69syv2rgb6fw6/tizentool-mac-v1.zip?dl=0) (embeds CLI v4)

Archives available in the [Dropbox tizentool folder](https://www.dropbox.com/sh/mzm5qhhlux8mdqq/AABm7pl3iSXqpFMeb_s3aRIXa?dl=0).


## CLI usage

WGT processing (v4+):

```bash
tizentool getappid "path/to/tizen.wgt"
tizentool sign "path/to/tizen.wgt" "path/to/signed-tizen.wgt"
tizentool unpack "path/to/tizen.wgt" "target/folder"
tizentool pack "target/folder" "path/to/signed-tizen.wgt" [--sign]
```

Device operations:

```bash
tizentool 10.2.1.254 debug "path/to/tizen.wgt" [--sign]
tizentool 10.2.1.254 debug Clkwtp8Hwq.AppName
tizentool 10.2.1.254 run "path/to/tizen.wgt" [--sign]
tizentool 10.2.1.254 run Clkwtp8Hwq.AppName
tizentool 10.2.1.254 install "path/to/tizen.wgt" [--sign]
tizentool 10.2.1.254 uninstall Clkwtp8Hwq.AppName
tizentool 10.2.1.254 uninstall "path/to/tizen.wgt"
tizentool 10.2.1.254 rmfile "/remote/path/to/tizen.wgt"
```

The IP can be omitted (v4+), in which case it should be provided as
a `TIZEN_IP` environment variable:

```bash
# Windows
set TIZEN_IP=10.2.1.254
tizentool run Clkwtp8Hwq.AppName

# Mac/Linux
export TIZEN_IP=10.2.1.254
tizentool run Clkwtp8Hwq.AppName
```

Or set `TIZEN_IP` in a local `.env` file, like for the repack variables.

## Signing configuration

Some commands accept an extra `--sign` argument to re-sign packages,
in case they are signed by unsupported certificates or invalid SDK version.

The following environment variables are required for re-signing:

```properties
CERT_AUTHOR_PATH=/path/to/author.p12
CERT_AUTHOR_PASS=12345678
CERT_DISTRIBUTOR_PATH=/path/to/distributor.p12
CERT_DISTRIBUTOR_PASS=12345678
```

Environment variables can be provided using a local `.env` properties file
in the current working directory.

If signing fails, verify your passwords using the following command:

```bash
openssl pkcs12 -info -in /path/to/file.p12
# you will be asked to enter the password and will see some metadata about the file
```

## Verbose mode

For further logging and troubleshooting, set `LOG_LEVEL=DEBUG` environment
or use `tizentool-log` instead of regular `tizentool` as following:

```bash
tizentool-log 10.2.1.254 debug "path/to/tizen.wgt" --sign
```

## Documentation

- [Tizentool CLI](https://wiki.massiveinteractive.com/display/QPP/Tizentool+CLI)
- [Tizentool GUI](https://wiki.massiveinteractive.com/display/QPP/Tizentool+GUI)
