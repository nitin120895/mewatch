## Linear workflow

### Subscribe channel schedule

In order to subscribe to a channel's schedule needs to be called `pullSchedule` action.
During the execution of this action will be set `assetLimit` and `timeLimit` for the specified channel and created schedule puller.

It takes three arguments:

- `channelId` - subscription channel id
- `assetLimit` - set limit for loading assets
- `timeLimit` - set time range of loading from now

### Unsubscribe channel schedule

In order to unsubscribe a channel schedule needs to be called `releaseSchedule` action with passed channel id.

### Schedule puller

Schedule puller is responsible for loading assets based on `assetLimit` and `timeLimit`.

It takes two arguments:

- `onTaskComplete` - callback function which is called each time new chunk of assets is loaded
- `getChannelScheduleInfo` - callback function which is called to get actual channel info in `ChannelScheduleInfo` format

as result, it returns a function that expects to be called with specified channel id.

#### Creating schedule puller for the first time

For the first loading, we ask for the maximum allowed time range and set a timer for the next update.
The next data will be loaded when duration outstanding assets less than `timeLimit` and count of outstanding assets less than `assetLimit`.

#### Creating schedule puller for existing channel

If new schedule puller has `assetLimit` or `timeLimit` greater than existing one has then it will be replaced by the new one.

If new schedule puller has `assetLimit` and `timeLimit` less than the existing one has then it will be skipped.
