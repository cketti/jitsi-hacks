if (!window.JitsiMeetJS) {
  console.log("[Jitsi Hacks] Couldn't find Jitsi Meet");
} else if (document.getElementById('jitsi-hacks-emoji-reaction')) {
  console.log("[Jitsi Hacks] The script has already been loaded");
} else (function() {
  const emojis = [
    {
      cssName: 'thumbs-up',
      url: 'https://jitsi-hacks.cketti.eu/thumbs_up.png'
    },
    {
      cssName: 'thumbs-down',
      url: 'https://jitsi-hacks.cketti.eu/thumbs_down.png'
    },
    {
      cssName: 'zipper-mouth-face',
      url: 'https://jitsi-hacks.cketti.eu/zipper_mouth_face.png'
    },
    {
      cssName: 'raising-hands',
      url: 'https://jitsi-hacks.cketti.eu/raising_hands.png'
    },
    {
      cssName: 'hourglass',
      url: 'https://jitsi-hacks.cketti.eu/hourglass.png'
    },
    {
      cssName: 'framed-picture',
      url: 'https://jitsi-hacks.cketti.eu/framed_picture.png'
    },
    {
      cssName: 'clapping-hands',
      url: 'https://jitsi-hacks.cketti.eu/clapping_hands.png'
    },
    {
      cssName: 'waving-hand',
      url: 'https://jitsi-hacks.cketti.eu/waving_hand.png'
    }
  ];

  const timeout = 30 * 1000;

  let defaultAvatar = undefined;
  let timer = null;

  function getCurrentAvatar() {
    return APP.store.getState()['features/base/settings'].avatarURL ?? null;
  }

  function changeAvatar(avatarUrl) {
    if (timer != null) {
      clearTimeout(timer);
    }

    sendAvatarUrl(avatarUrl);

    if (defaultAvatar == undefined) {
      defaultAvatar = getCurrentAvatar();
    }

    timer = setTimeout(() => { sendAvatarUrl(defaultAvatar); }, timeout);
  }

  function sendAvatarUrl(avatarUrl) {
    console.log("[Jitsi Hacks] Sending avatarUrl: " + avatarUrl)
    APP.conference.commands.sendCommand("avatar-url", { value: avatarUrl });
  }

  function onEmojiButtonClick(event) {
    let url = event.target.dataset.url;
    changeAvatar(url);
    $.prompt.close();
  }

  function showEmojiReactionDialog() {
    APP.UI.messageHandler.openDialog(
      "Emoji reaction",
      `
      <div class="jitsi-hacks-emoji-button-container">
        ${emojis.map(emoji =>
          `<button type="button" class="jitsi-hacks-emoji-button jitsi-hacks-${emoji.cssName}" data-url="${emoji.url}"></button>`
        ).join("")}
      </div>
      `,
      false,
      {
        'Cancel': false
      },
      (e, submitValue) => {
        // Do nothing
      },
      () => {
        $(".jitsi-hacks-emoji-button-container button").click(onEmojiButtonClick);
      }
    );
  }

  function addEmojiImageStyles() {
    $('head').append(`
      <style>
        .jitsi-hacks-emoji-button-container {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
        }
        .jitsi-hacks-emoji-button {
          width: 70px;
          height: 70px;
          background-size: 50px 50px;
          border: 1px solid #aaa;
          background-color: rgba(255, 255, 255, 0.1);
          background-repeat: no-repeat;
          background-position: center;
          margin-right: 8px;
          margin-bottom: 8px;
        }
        .jitsi-hacks-emoji-button:hover {
          border: 1px solid #ccc;
          background-color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
        }
        ${emojis.map(emoji =>
          `
          .jitsi-hacks-${emoji.cssName} {
            background-image: url(${emoji.url});
          }
          `
        ).join("")}
      </style>
    `);
  }

  function addEmojiReactionButton() {
    emojiReactionButton = $(`
      <div id="jitsi-hacks-emoji-reaction" aria-pressed="false" aria-disabled="false"
          aria-label="Emoji reaction" class="toolbox-button" tabindex="0" role="button" title="Emoji reaction via avatar">
        <div>
          <div class="toolbox-icon">
            <div class="jitsi-icon">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="m 5.2714844,14.644531 a 7.237288,7.237288 0 0 0 3.109375,3.623047 7.237288,7.237288 0 0 0 7.2382816,0 7.237288,7.237288 0 0 0 3.109375,-3.623047 z M 18,8 a 2,2 0 0 1 -2,2 2,2 0 0 1 -2,-2 2,2 0 0 1 2,-2 2,2 0 0 1 2,2 z M 10,8 A 2,2 0 0 1 8,10 2,2 0 0 1 6,8 2,2 0 0 1 8,6 2,2 0 0 1 10,8 Z M 12,0 C 5.3844276,0 0,5.3844276 0,12 0,18.615572 5.3844276,24 12,24 18.615572,24 24,18.615572 24,12 24,5.3844276 18.615572,0 12,0 Z m 0,2 C 17.534692,2 22,6.4653079 22,12 22,17.534692 17.534692,22 12,22 6.4653079,22 2,17.534692 2,12 2,6.4653079 6.4653079,2 12,2 Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `);

    emojiReactionButton.click(showEmojiReactionDialog);

    $('div.button-group-right').prepend(emojiReactionButton);
  }

  addEmojiImageStyles();
  addEmojiReactionButton();

  APP.keyboardshortcut.registerShortcut('E', null, () => {
    showEmojiReactionDialog();
  }, "Emoji reaction");

  console.log("[Jitsi Hacks] Emoji Reaction script loaded.");
})();
