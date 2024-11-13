## Development

Follow the same setup as for regular web, excepted for dev mode run:

    npm run dev:tv
    npm run dev:<platform>

## Browser compatibility

Embedded browsers on TV are less varied than on desktop, but browsers will typically
be old versions from the year the TV was launched.

### Typical platforms

- Webkit from a few years ago (webOS < 3, Tizen < 2017)
- Chromium (webOS >= 3, Tizen >= 2017)
- Edge (XBox)
- Opera Presto (legacy TVs, see further in this page)

See:

- https://developer.samsung.com/tv/develop/specifications/web-engine-specifications
- http://webostv.developer.lge.com/discover/specifications/web-engine/

### CSS restrictions

For best compatibility and performance, the following rules should be respected.

- No media queries / responsiveness: layout everything in pixels for 1080p,
- Prioritise CSS2.1 features,
- Prioritise `left/top/padding` over `transform`,
- Only some CSS3 features are safe like:
    - `border-radius`,
    - `::before`, `::after`,
    - `box-sizing`,
- Limit CSS3 animation/transition; they may be disabled,
- Forbid `flexbox` or `grid` layout,
- Avoid shadows; they may not be rendered or cause memory issues,
- Avoid gradients; they may not be rendered,
- Avoid scale transforms; they cause rendering and memory issues,
- Avoid SVG; they may be incorrectly rendered,
- No CSS3D, `border-image`, multiple backgrounds...

## TV Resolution variables

All the size values that we use in the JS have to be created as sass variables and
exported to JS. What we are doing is styling the app for 1920x1080p and then calculating the ratio at build time of all the fixed size values for 1280x720p.

We only need to set `RES=RES_720p` in the environment (see `.env`) to enable it.

We have created a post-css plugin to calculate the ratio
(`build/script/modules/postcss-resolution-change.js`) and a global
variable in webpack to know which resolution we have to build
(`clientEnvVars._FHD_ = process.env.RES !== 'RES_720p';`).

### Adding a new variable shared with JS

- Add value in `src/ref/tv/style/modules/_size-variables.scss`:

```css
$viewport-width: 1920 + 0px;
```

- Add JS export in `src/ref/tv/style/exports.scss`:

```css
:export {
    viewportWidth: $viewport-width;
    ...
}
```

- Declare it in `src/ref/tv/util/sass.ts`:

```javascript
type SassStyles = {
    viewportWidth: number;
    ...
}
```

- Import `sass.ts` in the component:

```javascript
import sass from 'ref/tv/util/sass';

const viewportWidth = sass.viewportWidth;
```

## About Opera Presto

Opera Presto is NOT supported officially by the reference TV app, however some projects
will often port the app to legacy plaforms, so it is our interest to build an app with
a good intrinsic compatibility with with.

These legacy TV platforms usually used Opera Presto, typically version 12:

- Samsung Orsay,
- LG Netcast,
- Sony CEB,
- Panasonic Viera,
- etc.

Opera 12.15 can still be downloaded for desktop for local debugging:

- https://opera.en.uptodown.com/windows/download/42741
- https://opera.en.uptodown.com/mac/download/42742

## HTTPS issues

Some old TVs (and Opera 12 on the desktop), don't support some SSL certificates, which
means it sometimes won't load Rocket on HTTPS.

Solution is to create a reverse proxy with nginx for instance:

Edit `/usr/local/etc/nginx/nginx.conf` or `C:\nginx\confg\nginx.conf`, like:

```properties
# proxies the entire domain in HTTP
server {
    listen 9001;
    server_name localhost;
    location / {
        proxy_pass https://sandbox.massiveaxis.com;
    }
}
```

Point to the proxy in `.env`:

    CLIENT_SERVICE_URL=http://localhost:9001/api
    CLIENT_SERVICE_CDN_URL=http://localhost:9001/api

You would use your IP instead of `localhost` if the client is a TV.
