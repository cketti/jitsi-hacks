---
title: "Change subject"
description: "Allows changing the subject of a room"
hero_height: is-normal
---

Allows changing the subject of a room.


## Installation

Drag the following link into your browser's bookmark bar: [Change subject](javascript:(function()%7Bif%20(window.APP%20%26%26%20APP.store)%20%7Bconst%20state%20%3D%20APP.store.getState()%3Bif%20(state%20%26%26%20state%5B'features%2Fbase%2Fconference'%5D%20%26%26%20state%5B'features%2Fbase%2Fconference'%5D.conference%20%26%26state%5B'features%2Fbase%2Fconference'%5D.conference.room)%20%7Bconst%20subject%20%3D%20prompt(%22Change%20subject%22%2C%20APP.store.getState()%5B'features%2Fbase%2Fconference'%5D.subject)%3Bif%20(subject%20!%3D%20null)%20%7BAPP.store.getState()%5B'features%2Fbase%2Fconference'%5D.conference.room.setSubject(subject)%3B%7D%7D%7D%7D)()){: .bookmarklet}

To inject the hack click the link in the bookmark bar while the Jitsi Meet tab is active. The effects only last until
the next page reload.


## Usage

After clicking the link in the bookmark bar you'll be prompted to enter a new subject.

The subject is displayed at the top of the screen when the toolbars are visible. If no subject is set the room name is
displayed.

With Jitsi's default configuration only moderators are allowed to change a room's subject.


## How does it work?

The [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) uses Jitsi's
[built-in functionality](https://github.com/jitsi/jitsi-meet/blob/997c3f75b582baa7130315a80f242b010bf94d6d/conference.js#L2812-L2841)
to change the avatar URL. The URL is persisted automatically by Jitsi Meet along other values like the display name.


## Source Code

```javascript
// All of this code is contained in the bookmarklet
if (window.APP && APP.store) {
    const state = APP.store.getState();
    if (state && state['features/base/conference'] && state['features/base/conference'].conference &&
            state['features/base/conference'].conference.room) {
        const subject = prompt("Change subject", APP.store.getState()['features/base/conference'].subject);
        if (subject != null) {
            APP.store.getState()['features/base/conference'].conference.room.setSubject(subject);
        }
    }
}
```
