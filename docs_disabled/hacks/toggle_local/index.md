---
title: "Toggle own video"
description: "Show/hide your own video tile"
hero_height: is-normal
---

Show/hide your own video tile.


## Installation

Drag the following link into your browser's bookmark bar: [Toggle own video](javascript:(function()%7B%24('%23localVideoContainer').toggle()%3B%7D)()){: .bookmarklet}

To inject the hack click the link in the bookmark bar while the Jitsi Meet tab is active. The effects only last until
the next page reload.


## Usage

Clicking the link in the bookmark bar toggles the visibility of your own video tile.


## How does it work?

The [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) simply toggles the visibility of the container in the
DOM tree.


## Source Code

```javascript
// This is the code contained in the bookmarklet
$('#localVideoContainer').toggle();
```
