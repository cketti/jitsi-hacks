if (!window.JitsiMeetJS) {
  console.log("[Jitsi Hacks] Couldn't find Jitsi Meet");
} else if (document.getElementById('jitsi-hacks-emoji-reaction')) {
  console.log("[Jitsi Hacks] The script has already been loaded");
} else (function() {
  const emojis = [
    {
      cssName: 'thumbs-up',
      url: 'https://jitsi-hacks.cketti.eu/thumbs_up.svg'
    },
    {
      cssName: 'thumbs-down',
      url: 'https://jitsi-hacks.cketti.eu/thumbs_down.svg'
    },
    {
      cssName: 'zipper-mouth-face',
      url: 'https://jitsi-hacks.cketti.eu/zipper_mouth_face.svg'
    },
    {
      cssName: 'raising-hands',
      url: 'https://jitsi-hacks.cketti.eu/raising_hands.svg'
    },
    {
      cssName: 'hourglass',
      url: 'https://jitsi-hacks.cketti.eu/hourglass.svg'
    },
    {
      cssName: 'framed-picture',
      url: 'https://jitsi-hacks.cketti.eu/framed_picture.svg'
    },
    {
      cssName: 'clapping-hands',
      url: 'https://jitsi-hacks.cketti.eu/clapping_hands.svg'
    },
    {
      cssName: 'waving-hand',
      url: 'https://jitsi-hacks.cketti.eu/waving_hand.svg'
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
            <div class="jitsi-icon">E</div>
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
