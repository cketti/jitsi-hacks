---
title: "Change avatar"
description: "Allows changing the avatar without having to use Gravatar"
hero_height: is-normal
---

Allows changing the avatar without having to use Gravatar.


## Installation

Drag the following link into your browser's bookmark bar: [Change avatar](javascript:(function()%7Bif%20(window.APP%20%26%26%20APP.store)%20%7Bconst%20state%20%3D%20APP.store.getState()%3Blet%20avatarUrl%20%3D%20'https%3A%2F%2Fjitsi-hacks.cketti.eu%2Ftwemoji_smiling_face_with_sunglasses.png'%3Bif%20('features%2Fbase%2Fsettings'%20in%20state%20%26%26%20'avatarURL'%20in%20state%5B'features%2Fbase%2Fsettings'%5D)%20%7Bconst%20oldAvatarUrl%20%3D%20state%5B'features%2Fbase%2Fsettings'%5D.avatarURL%3Bif%20(oldAvatarUrl.length%20%3E%200)%20%7BavatarUrl%20%3D%20oldAvatarUrl%3B%7D%7Dconst%20newAvatarUrl%20%3D%20prompt(%22Avatar%20URL%22%2C%20avatarUrl)%3Bif%20(newAvatarUrl%20!%3D%20null)%20%7BAPP.conference.changeLocalAvatarUrl(newAvatarUrl)%3B%7D%20else%20%7Bconsole.log('%5BJitsi%20Hacks%5D%20Not%20a%20Jitsi%20page')%3B%7D%7D%7D)()){: .bookmarklet}

To inject the hack click the link in the bookmark bar while the Jitsi Meet tab is active. The effects only last until
the next page reload.


## Usage

After clicking the link in the bookmark bar you'll be prompted to enter a URL for your avatar image. The default value
is an image of the [smiling face with sunglasses](https://emojipedia.org/smiling-face-with-sunglasses/) emoji: 😎

The avatar URL will be saved to the browser's local storage, just like your display name. That means you only have to
use the bookmarklet once per Jitsi instance.


## How does it work?

The [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) uses Jitsi's
[built-in functionality](https://github.com/jitsi/jitsi-meet/blob/997c3f75b582baa7130315a80f242b010bf94d6d/conference.js#L2812-L2841)
to change the avatar URL. The URL is persisted automatically by Jitsi Meet alongside other values like the display name.


## Source Code

```javascript
// All of this code is contained in the bookmarklet
if (window.APP && APP.store) {
    const state = APP.store.getState();
    let avatarUrl = 'https://jitsi-hacks.cketti.eu/twemoji_smiling_face_with_sunglasses.png';
    if ('features/base/settings' in state && 'avatarURL' in state['features/base/settings']) {
        const oldAvatarUrl = state['features/base/settings'].avatarURL;
        if (oldAvatarUrl.length > 0) {
            avatarUrl = oldAvatarUrl;
        }
    }

    const newAvatarUrl = prompt("Avatar URL", avatarUrl);
    if (newAvatarUrl != null) {
        APP.conference.changeLocalAvatarUrl(newAvatarUrl);
    } else {
        console.log('[Jitsi Hacks] Not a Jitsi page');
    }
}
```
