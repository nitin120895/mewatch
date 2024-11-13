# Locale Strings

### String Bundles

Each locale language has its own JSON file containing the necessary strings used by the application. To add a new locale simply
create a file and name it `strings-${locale}.json` and ensure it provides a value for all of the predefined values in your
other existing bundles.

The locale coutry code should be 2 characters (ISO 639) e.g. for Chinese `zh` => `strings-zh.json`.
It can optionally include a region/dialect extension e.g. for Chinese (Simplified) `zh-cn` => `strings-zh-cn.json`.

> **Please ensure these are always provided in lowercase**.

Operators within Presentation Manager may publish languages in either lowercase (`en-us`) or mixed case (`en-US`).
By always enforcing lowercase filenames we can gaurantee we'll resolve the matching file regardless of casing.

### Environmental Locale Support

**The env variable `CLIENT_LOCALES` defines which of the string JSON files in this folder will be bundled by webpack at compile time.**

Each bundle becomes a chunked dependency and is loaded in at runtime based on the active locale.
This defaults to the env variable `CLIENT_DEFAULT_LOCALE`. If `CLIENT_DEFAULT_LOCALE` is `undefined` then the locale will default to `en`.

### Locale Data

Different languages may structure their pluralisation, dates/time, currency, etc differently. These rules are provided via [`react-intl`](https://github.com/yahoo/react-intl/wiki#loading-locale-data).

For each language which we support via our JSON string bundles, we need to load the matching locale data rules to ensure they're aligned.
These are automatically bundled during compilation via `build/webpack/vendor/locale-bundles.js` based on the values provided for `CLIENT_LOCALES`.

> Reminder: Ensure you include your newly added locale within `CLIENT_LOCALES` otherwise it won't be included!

### External Content Data

There is a separation between UI labelling and external content data. The string bundles contain application labels and messaging.
External data is localised via the data published through Rocket via Presentation Manager.

Supported languages are published by operators dynamically and may mismatch the string bundles provided by the application.
In this case the default locale is used as a fallback for application UI labelling, while the external data is localised as
expected.

### Naming Convention

Each string needs a unique identifier. We recommend using a naming convention to group strings per component or section of the site.

For the reference apps we're using the pattern `${section}_${componentName}_${descriptor}`. e.g. `nav_switchProfile_label`.
The underscore separator is used to split grouping. CamelCase is used for naming where it makes sense.

You can instead use whichever naming convention you like.

Please note that strings can be accessed via object notation so an underscore is preferred over a hyphen to allow direct access.
e.g. `strings.app_title` compared to `strings['app-title']`.

Strings would then be grouped together by type e.g.

``` json
{
	"app_title": "Axis",
	"nav_switchProfile_label": "SWITCH",
	"nav_switchProfile_aria": "Switch profile",
	"search_input_label": "Search movies, tv shows, people..."
}
```

#### Merge Conflicts

During development as each pull request modifies or introduces new strings within their branch there will inevitably be
merge conflicts within your string bundles. A solid naming convention helps in resolving these issues making it easier
to resolve the diff correctly.
