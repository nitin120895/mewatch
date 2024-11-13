# Axis RWA Analytics #
## Introduction
This document provides a brief overview of concepts and required knowledge to work on the *Axis Reference Web App*
analytics feature.

The RWA analytics feature:
 - Uses V3 of the Analytics Spec

## Concepts ##
### Events ###
An _event_ is a blob of data which is sent after some interaction(s) in the app. The interaction could be
_user-input-driven_ i.e clicks or _ambient_ i.e page loading, timed event, navigation (there is no distinction in the
implementation).

The data attached in the blob consists of:
 - `type`: The event name
 - `timestamp`: Unix Epoch Time _event_ occured
 - `context`: An object of [contextual data](#contexts) for example _page_, _entry_, _item_
 - `detail`: Some event specific data

### Entry/Item ###
The Analytics data model is based off the Axis API. The API has two key entity types that represent content or
presentations of content. These are items and entries respectively.

#### Item ####
An item represents an asset within the app e.g. movie, episode - the typings can be found:
`src/shared/service/types.ts:669` An Item is typically represented by something like a Packshot (link with image).

types: `'movie' | 'show' | 'season' | 'episode' | 'program' | 'link' | 'trailer' | 'channel';`

#### Entry ####
An entry represents a presentation of one or more items (or some other custom content). This is typically a row within a
page but could be the header for example. H1 Hero. The typing can be found: `src/shared/service/types.ts:1253`

### Contexts ###
A _context_ is a blob of data attached to an _event_ with some contextual information. From the spec:
- All events include global context objects (`User`,  `Session`) and most also contain   `Page`
- Some events also require an  `Entry` context (`Entry Viewed` and  `Entry Interacted` ).
- All Item and Playback events also require an  `Entry` context and an  `Item` context.

Notes:
- There are typing for each event including the context. These should _always_ be used.

#### Page Context ####
Tracked as the user navigates (redux action: ) and attached to the event
#### Entry Context ####
An _entry context_ tries to capture which entry e.g. a list of movies -- is responsible for events relating to an item.
This depends on how the item became the centre of focus e.g. clicking on an item within a row on the home page with make
that row the _entry context_ for all subsequent events until another _item_ is interacted with. Some _transient events_
will not cause the context to be used for other events.

#### Session Context / User Context ####
Generated and stored once per user/session and attached to each event

## Implementation ##
The RWA Analytics implementation uses observable sequences to manage the event lifecycle. The incoming events (Redux
Action, Redux State Value, Dom Events) and are combined and mapped into the outgoing events (Transport/Log). To achieve
this it uses [RXJS](https://rxjs-dev.firebaseapp.com/).

### Overview ###
The implementation uses observables (RXJS) to represent the incoming and outgoing streams of data **(source)**. Each
subject is created and then passed to a function **(stream handler)** where operations are carried out to transform each
event. The return of each stream handler is the transformed source **(emitter)**. Callbacks are added to each emitter
**(subscription)** to perform an action for each event.  This will either be a side-effect (e.g. send the event to a
server) or *fed back into a matching source*. Feeding the **(emitter)** into the **(source)** creates a cyclical data
structure - which might sound odd but it is very similar to the  Redux store.
```
   +------------+                          +------------+
   |            v                          v            |
   |     DOM (Click Event)            Source Emit       |
   |            +                          +            |
   |            |                          |            |
   |            |                          |            |
   |            v                          v            |
   |     Dispatch Action              Transformation    |
   |            +                          +            |
   |            |                          |            |
   |            |                          |            |
   |            v                          v            |
   |     Update Store                 Emitter Emit ---->|
   |            +                          +            |
   |            |                          |            |
   |            |                          |            |
   |            v                          v            |
   |     Update DOM                   Side Effect       |
   |            +                          +            |
   |            |                          |            |
   +<-----------+                          +------------+
 ```

The only caveat is that **you must not pass a cyclical source directly to its emitter, or an infinite loop will occur**
- This is effectively the same a dispatching a redux action off itself e.g. case MY_ACTION: dispatch(MY_ACTION)

(Of course Redux makes this difficult to do directly but normally it would be action A dispatches action B which
dispatches action A etc)

The CONTEXT is modelled a cyclical source as it is both transformed by events, and utilised by it.

#### Integration into RWA ####
 - Import factory `axisAnalytics`
 - Invoke `axisAnalytics` with operators to perform on emitted events e.g. log/stream to GA
 - Pass the middleware on the created object to redux e.g. (this feeds redux action/state to analytics)
	 - ```const analytics = axisAnalytics(debugLog);```
	 - ```const middlewares = _SERVER_ ? [] : [analytics.middleware];```
 - Call run on the object during startup  ```analytics.run();``` (starts emitting events)
 - Pass the object to the Root component (provides callback functions to wrapped components)
	 - ```<Root store={store} renderProps={renderProps} analytics={analytics} />```

#### AnalyticsProvider / Wrappers ####
The `AnalyticsProvider` component provides the context that wrapped components use - this consumes the result of the
analytics factory and provides contexts for wrapped components.

In order for components to emit DOM events into analytics they must be wrapped with a higher-order-component that
extends the abstract class  `DomEventHandler` (for an example see: `wrapAnalyticsItem`) This automatically binds event
listeners for specified DOM events (overrideable through context) and emits them on the callbacks provided through the
context from `AnalyticsProvider`

### Guidelines ###
To implement an event you must transform a _source_ into and return it to the _event_ emitter. Here is an example
transforming clicks on Items to emitted events:
```
const getDetailFromDomEvent = ({ data: { index, image } }) => ({ position: index, image });
const getContextFromDomEvent = ({ data }, ctx) => ({ ...ctx, ...data });
const itemClicked$ = DOM_EVENT.pipe(
  isEventOfType(EventName.CLICK),
  isEventOfSource(DomEventSourceType.Item),
  toEvent(AnalyticsEventType.ITEM_CLICKED, getDetailFromDomEvent),
  withItemContext(CONTEXT, getContextFromDomEvent)
);
return { EVENT: itemClicked }
```
#### Sources ####
```ACTION```  - Redux actions
```STATE```  - Redux State
```DOM_EVENT```  - DOM events(click etc) + relevant data(item/trigger)
```CONTEXT``` - Value of ambient context objects attached to events

#### Emitters ####
```EVENT``` - Will emit to the operators provided in factory, expects event shaped things (strongly typed)
```CONTEXT``` - Will emit straight back into the context source - use to update the context

#### Helper Functions and Common Techniques ####
##### Common Custom Operators #####
` isEventOfType(...eventNames: Array<EventName>)` Used on `DOM_EVENT` source - filter stream to events of dom type e.g.
'click'. It expects an array of enum `EventNames` which is an enum of possible dom events e.g. 'click' etc

`isEventOfSource(sourceType: DomEventSourceType)` - Used on `DOM_EVENT` source - filter stream to events of source type
e.g. Item, Trigger. Expects an enum `DomEventSourceType`

`isActionOfType(...types: Array<RWAAction>)` - Used on ACTION source - filter to redux action type (specified in
`src/shared/analytics/types/v3/action/redux-actions.ts:51`)

`toEvent` - Transforms stream into event shaped object - Takes an event name (enum `AnalyticsEventType`) and an optional
detail provider function.  **by default the detail will be undefined** - you must provide a function to transform the
stream data to detail to attach detail to an event. This gives us strict type-checking for event payloads. e.g.
```
isActionOfType<ItemRatedAction>(RATE_ITEM),
toEvent(AnalyticsEventType.ITEM_RATED, ({ payload: { rating } }) => ({ rating })),
```

```withContext / withBasicContext / withEntryContext / withItemContext``` 
 - Transforms the output of `toEvent` to include the ambient context required. The second parameter is an optional
   function to map stream data into the context. You may want to do this because:
	 - The ambient context does not relate to this event (e.g. focus, hover)
	 - The ambient context has not been updated yet (e.g. click may set entry context, but click listener fires first)
	 - The data is not available in the ambient context (e.g. item rated - context comes from action)
```
const pageViewed$ = STATE.pipe(
    ...
   toEvent(AnalyticsEventType.PAGE_VIEWED),
   // Use the page from stream data as context has not been updated yet
   withContext((page, ctx) => ({ ...ctx, page: getPageContext(page) }))
```
### How To ###
 - Debug streams
	 - Use `logStream` - a custom operator that just outputs to console e.g.
	```
	const appReady$ = ACTION.pipe(
	  isActionOfType(PAGE_CHANGE, GET_PAGE),
	  logStream() // output the value at this point
	```
	- Subscribe to a stream and output to console e.g. `myStream$.subscribe((e) => console.log(e));

 - Transform some input
	 - Use the rxjs `map` function

 - Create a new stream every time an input stream emits:
	 - Use switchMap/concatMap etc -- WATCH THIS: https://www.youtube.com/watch?v=rUZ9CjcaCEw

 - Only emit when something has changed
	 - Use rxjs operators `distinctUntilChanged` / `distinctUntilKeyChanged`
	 - If you need to compare values vs references the operators take a function that does the comparison

 - Use information from another stream (combine)
	 - To emit all inputs whenever any input is updated, use `combineLatest`
	 - To emit with the last value from an input use `withLatestFrom` (NOTE!!!: INPUT WILL BE IGNORED UNTIL TARGET
	   STREAM HAS AT LEAST ONE VALUE)
	 - To emit when both inputs update, use `zip` (creates 1:1 relationship, be aware of back-pressure:
	   https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/backpressure.md)
	 - To emit whenever any of inputs emit,  `merge` -

 - Add a new event type e.g spec has updated _(note this will change when TypeScript is upraded)_
	 1) Create a new entry in `AnalyticsEventMap` using `AnalyticsEvent` which takes an optional `ContextProperty` and 
	 	`Detail` as generic type parameters. E.G
	```
		 type BrowseEvents = {
	     	  'Page Viewed': AnalyticsEvent<StandardContextProperty>;
		      'Searched': AnalyticsEvent<StandardContextProperty, BrowserSearchDetails>;
		  }
	 ```
	 2) Update the `AnalyticsEventType` enum to include the key use in the map

 - Add a new stream handler
	 1) Create a function that takes `Sources` and emits `Sinks` (emitters)
	 2) Add handler to `mainHandler` in  `src/shared/analytics/events/index.ts`

 - Add a new stream source (this should be fairly rare)
	1) Create a new proxy Subject in `src/shared/analytics/axisAnalytics.ts` and add to the `sources` variable
	2) Update the type information in `src/shared/analytics/types/stream.ts`

 - Add a new stream emitter (this should also be fairly rare)
	 1) Update the type information in `src/shared/analytics/types/stream.ts`
	 2) Subscribe to the output of the main stream handler in `src/shared/analytics/axisAnalytics.ts` to handle 
	    side-effect

#### Common Mistakes ###
 - Remember transformations/effects happen per subscription! The following code will log `Hello World` twice!
```
	const hello$ = of('Hello').pipe(
		tap((s) => console.log(s)),
	);
	const world$ = hello$.pipe(
		map((s) => s + 'world'),
	);
	hello$.subscribe(); // Logs as expected
	world$.subscribe(); // Also logs as world$ is subscribed to hello$
```
 - No event will be emitted until the correct context is available
	 - if your data is not making it past `withContexts` you may not be specifying the correct context type or not
	   mapping the context correctly
	 - The ambient context should always contain `Session`, `User`, `Page`.  The `Entry` is set with navigation-type
	   events and the `Item` must always be mapped.
	 - If there is no entry and you try to emit an item event without mapping entry data it will wait until the ambient
	   context is available which may be irrelevant by the time the event is emitted. Fortunately this scenario _should_
	   be impossible (as the ambient Entry should default to something sensible).

 - Combining streams in the correct way can be tricky. Spend some time thinking down how the streams are combined and
   consider drawing a marble diagram to help.


## Events List ##

Key:
 - R - Implemented (awaiting review)
 - Q - Ready for QA (code is approved)
 - C - Complete (signed off by QA)

| Status | Name                  |
|:------:|-----------------------|
| R      | App Started           |
| R      | App Ready             |
| R      | App Closed            |
| R      | App Offline           |
| R      | App Online            |
| R      | User Identified       |
| R      | User Profile Selected |
| R      | User Signed Out       |
| R      | User Actioned         |
| R      | User Registering      |
| R      | User Registered       |
| R      | Server Error          |
| R      | Client Error          |
| -      | System Error          |
| -      | Unknown Error         |
| R      | Resource Error        |
| R      | Page Viewed           |
| R      | Searched              |
| -      | Entry Viewed          |
| R      | Entry Interacted      |
| -      | Item Viewed           |
| R      | Item Focused          |
| R      | Item Clicked          |
| R      | Item Detail Viewed    |
|        | Item Watched          |
|        | Item Actioned         |
| R      | Item Bookmarked       |
| R      | Item Rated            |
|        | Item Offered          |
|        | Item Rented           |
|        | Item Owned            |
| R      | Video Initialized     |
| R      | Video Requested       |
| R      | Video Started         |
| R      | Video Progressed      |
| R      | Video Completed       |
| R      | Video Error           |
| R      | Video Actioned        |
| R      | Video Buffered        |
| R      | Video Paused          |
| R      | Video Resumed         |
| R      | Video Seeked          |
| R      | Video Restarted       |
| R      | Video Chainplayed     |


## Recommended Reading ##

### External References ###
 - RXJS
	- [API](https://rxjs-dev.firebaseapp.com/api)
	- [Examples](https://www.learnrxjs.io/)
