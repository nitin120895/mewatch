# Kaltura player

Toggle ptoject is using Kaltura player for video playback. Under Massive maintenence we have a [fork](https://github.com/massiveinteractive/kaltura-player-js) from original Kaltura [repo](https://github.com/kaltura/kaltura-player-js.git).
In this fork we are maintaining `minimal` branch where we exclude some modules to reduce the build size. For example (PlayKit JS UI, PlayKit JS DASH, Shaka, Cast, Js-Logger)

## Versioning

This fork has similar versioning as the original Kaltura player, for example 
```
v<%kaltura-player-version>-minimal
```
For example 
```
v0.37.3-minimal
```
Only tags ending with `-minimal` should be used
 
## Kaltura Module

Kaltura module is linked as dev dependancy to this project direcly from github
```
"kaltura-player-js": "https://github.com/massiveinteractive/kaltura-player-js#v0.37.3-minimal",
```