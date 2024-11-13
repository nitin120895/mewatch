## Chromecast Implementation

Chromecast is implemented for desktop web only, no chromecast for mobile browsers.

#### Initialization
Web sender uses Default Media Receiver for video casting. (the plan is to use Custom Receiver or at least Styled Media Receiver )
https://developers.google.com/cast/docs/receiver_apps

Google Cast Chrome Sender API library url is https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1

The Cast Sender Framework API uses the cast.framework.* and chrome.cast.* namespaces

The Cast button component is handled entirely by the framework and injected into [`./src/ref/responsive/player/controls/ControlsCast.ts`](./src/ref/responsive/player/controls/ControlsCast.ts) component as a part of [`./src/ref/responsive/player/PlayerControls.ts`](./src/ref/responsive/player/PlayerControls.ts) component

After loading the framework API, the app will call the handler window.__onGCastApiAvailable. Within this handler, initialization of Cast interaction is defined by calling the CastContext.setOptions method (see ```initPlayer()``` from [`./src/ref/responsive/player/cast/getCastPlayer.ts`](./src/ref/responsive/player/cast/getCastPlayer.ts))

#### Expanded Controller

Expanded Controller is implemented as separate component [`./src/ref/responsive/player/cast/CastPlayerStandard.ts`](./src/ref/responsive/player/cast/CastPlayerStandard.ts)

```Watch``` page has switcher for using either ```PlayerStandard``` or ```CastPlayerStandard```.

```CastPlayerStandard``` has [`./src/ref/responsive/player/cast/CastPlayerComponent.ts`](./src/ref/responsive/player/cast/CastPlayerComponent.ts) component with Expanded player implementation.
It contains Meatadata with Back button, Player Controls with loading spinner, Play and Pause buttons, Volume control, Progress bar and remaining time label. ```CastPlayerComponent``` contains also label with cast status (```Connecting``` or ```Cast to: Cast Device name```)

When user is not connected to chromecast and navigates to ```Watch``` page, he/she can establish the connection with ```Cast``` button form Player Controls. After pushing ```Cast``` button user has to select chromecast device, connection will been established and Expanded controller will appear.

Each time user navigates to ```Watch``` page and is connected to chromecast, remote playback stops and reload with new item medias data. The only one exception is when user navigates to ```Watch``` page of the item which is already casting. In that case Expanded controller just synchronizes with remote player state.

User can stop casting with ```Cast``` button as well. When user disconnected, application navigates to the item detail page.

#### Mini Controller

Mini Controller is implemented in [`./src/ref/responsive/player/cast/CastPlayer.ts`](./src/ref/responsive/player/cast/CastPlayer.ts) component. It appears in all other than ```Watch```, ```Sign In``` or ```Register```  pages when casting is active and contains Pause, Play buttons, Spinner for Buffering state, Metadata and Image of casting item.

Each time user opens any other than ```Watch```, ```Sign In``` or ```Register``` pages and is connected to chromecast , Mini player synchronizes with remote player state.

#### Chain Play

```Chain Play``` is also implemented for chromecast and is synchronized with web version. When user starts episode's playback on chromecast, next item, if available and chainplay is allowed, is loading in background and sending with medias as next item to chromecast. Next item has ```Countdown``` from PM settings.

We don't show ```Countdown``` in Expanded controller due to synchronization issue between Web application and cast device.

Web application doesn't start next item automatically by itself when casting is active. Web application just wait for current item change on chromecast device and updates local item with new one. Application is redirected to the new item's watch page and synchronizes Expanded Controller with remote player state.

When user is on other than ```Watch``` page and Mini controller is visible, Mini controller will update its state and metadata with new item during chain play process as well.
