# Components description
## Packshot component
Packshot component becomes a bit complicated with the implementation of new subcomponents inside.
You'll find clarifications related to some of them below.

Some flag properties define visibility of subcomponents:

    hasHover?: boolean;
	hasOverlay?: boolean;
	hasPlayIcon?: boolean;
	hasImageShadow?: boolean;

In Packshot's constructor we:
 - check watch options: watchable state and its watch path if exists;
 - get progress value for watched item;
 - define main navigation path for item;
 - resolve images for current size;

When user clicks on Packshot, application navigates to item detail page.

### **Packshot Image component**
Image component uses already resolved image urls.<br />
If there are no any resolved images, item title will be added in the middle of component.

### **Packshot Image Shadow component**
Image Shadow is visible when item has progress bar or item's title has 'overlay' position. It depends on `hasImageShadow` flag as well.

### **Packshot Title component**
[`src/ref/responsive/component/PackshotTitle.tsx`](PackshotTitle.tsx)

### **Packshot Progress Bar component**
Progress Bar is visible when item's progress is more than 0.
More info here [`src/ref/responsive/component/ProgressBar.tsx`](ProgressBar.tsx)

### **Packshot Overlay component**
Show Overlay when mouse is over packshot. It depends on `hasOverlay` flag as well.<br />
Overlay has `Dark` style mode when Play Icon is available.<br />
When user clicks on Overlay, application navigates to item detail page.

### **Packshot Play Icon component**
Show Play Icon when mouse is over packshot and item is watchable. It depends on `hasPlayIcon` flag as well.<br />
Play icon is available from `desktop` breakpoint at the moment, not for mobile devices.<br />
One exception is `D2 Episode List` component with disabled packshot. We show Play Icon here for all breakpoints.<br />
When user clicks on Play Icon, application navigates to watch page.

More info here [`src/ref/responsive/component/icons/PlayIcon.tsx`](PlayIcon.tsx)

### **Packshot Hover component**
Show Hover popup when mouse is moving over packshot and item is visible enough on the screen. It depends on `hasHover` flag as well.<br />
Hover popup is available from `desktop` breakpoint at the moment, not for mobile devices.<br />

Hover popup includes item title, subtitle, truncated description, rating and progress bar.<br />
The width of the hover popup is dynamic. In most cases, there is minimum width (234px) for all types of packshots and for wider packshots hover popup has the same width as packshot. Some width corrections have been done for account page due to small packshots widths.<br />
All size/position settings for hover popups have been implemented in css only.<br />

When user clicks on Hover popup, application navigates to item detail page.<br />

More info here [`src/ref/responsive/component/PackshotHover.tsx`](PackshotHover.tsx)

---------------------------------
**All packshots from menu content hasn't overlay, hover modals and play icon.**
