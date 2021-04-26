if (!window.JitsiMeetJS) {
  console.log("[Jitsi Hacks] Couldn't find Jitsi Meet");
} else if (document.getElementById('jitsi-hacks-emoji-reaction')) {
  console.log("[Jitsi Hacks] The script has already been loaded");
} else (function() {
  // Base URL for emoji images; make sure it ends with a slash
  const emojiBaseUrl = 'https://jitsi-hacks.cketti.eu/';

  const emojis = [
    {
      cssName: 'thumbs-up',
      url: emojiBaseUrl + 'thumbs_up.png'
    },
    {
      cssName: 'thumbs-down',
      url: emojiBaseUrl + 'thumbs_down.png'
    },
    {
      cssName: 'zipper-mouth-face',
      url: emojiBaseUrl + 'zipper_mouth_face.png'
    },
    {
      cssName: 'raising-hands',
      url: emojiBaseUrl + 'raising_hands.png'
    },
    {
      cssName: 'hourglass',
      url: emojiBaseUrl + 'hourglass.png'
    },
    {
      cssName: 'framed-picture',
      url: emojiBaseUrl + 'framed_picture.png'
    },
    {
      cssName: 'clapping-hands',
      url: emojiBaseUrl + 'clapping_hands.png'
    },
    {
      cssName: 'waving-hand',
      url: emojiBaseUrl + 'waving_hand.png'
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
    MicroModal.close('modal-emoji');
  }

  function showEmojiReactionDialog() {
    MicroModal.show('modal-emoji');
  }

  function addEmojiImageStyles() {
    $('head').append(`
      <style>
        .modal {
          display: none;
        }
        .modal.is-open {
          z-index: 1000;
          display: block;
        }
        .modal__footer {
          display: flex; 
          justify-content: flex-end;
        }
        .modal__overlay {
          z-index: 1000;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal__container {
          background-color: rgb(40, 52, 71);
          padding: 30px;
          max-width: 500px;
          max-height: 100vh;
          overflow-y: auto;
          box-sizing: border-box;
          border-radius: 3px;
          box-shadow: rgb(9 30 66 / 8%) 0px 0px 0px 1px, rgb(9 30 66 / 8%) 0px 2px 1px, rgb(9 30 66 / 31%) 0px 0px
        }
        .modal__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal__title {
          margin-top: 0;
          margin-bottom: 0;
          box-sizing: border-box;
          font-size: 20px;
          font-style: inherit;
          font-weight: 500;
          letter-spacing: -0.008em;
          line-height: 1;
          color: rgb(184, 199, 224);
        }
        .modal__close {
          background: transparent;
          border: 0;
          fill: #b8c7e0;
        }
        .modal__content {
          margin-top: 2rem;
          margin-bottom: 2rem;
          line-height: 1.5;
          color: rgb(184, 199, 224);
        }
        .modal__btn {
          -webkit-box-align: baseline;
          align-items: baseline;
          border-width: 0px;
          border-radius: 3px;
          box-sizing: border-box;
          display: inline-flex;
          font-size: inherit;
          font-style: normal;
          font-family: inherit;
          font-weight: 500;
          max-width: 100%;
          position: relative;
          text-align: center;
          text-decoration: none;
          transition: background 0.1s ease-out 0s, box-shadow 0.15s cubic-bezier(0.47, 0.03, 0.49, 1.38) 0s;
          white-space: nowrap;
          background: none;
          cursor: pointer;
          height: 2.28571em;
          line-height: 2.28571em;
          padding: 0px 10px;
          vertical-align: middle;
          width: auto;
          -webkit-box-pack: center;
          justify-content: center;
          color: rgb(159, 176, 204) !important;
        }
        .modal__btn:focus, .modal__btn:hover {
          background: rgb(49, 61, 82);
          text-decoration: inherit;
          transition-duration: 0s, 0.15s;
          color: rgb(159, 176, 204) !important;
        }
        .modal__btn:active {
          background: rgb(179, 212, 255);
          transition-duration: 0s, 0s;
          color: rgb(0, 82, 204) !important;
        }
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
  
  function addMicroModalScript() {
      let script = document.createElement('script');
      script.src = 'https://jitsi-hacks.cketti.eu/micromodal.min.js';
      document.body.appendChild(script);
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

    $('div.toolbox-button-wth-dialog').before(emojiReactionButton);
  }

  function addEmojiReactionDialog() {
    $(document.body).append(`
      <div class="modal micromodal-slide" id="modal-emoji" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
          <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-emoji-title">
            <header class="modal__header">
              <h2 class="modal__title" id="modal-emoji-title">Emoji Reaction</h2>
              <button class="modal__close" aria-label="Close modal" data-micromodal-close>
                <svg height="22" width="22" viewBox="0 0 24 24" data-micromodal-close><path d="M18.984 6.422L13.406 12l5.578 5.578-1.406 1.406L12 13.406l-5.578 5.578-1.406-1.406L10.594 12 5.016 6.422l1.406-1.406L12 10.594l5.578-5.578z"></path></svg>
              </button>
            </header>
            <main class="modal__content" id="modal-emoji-content">
              <div class="jitsi-hacks-emoji-button-container">
                ${emojis.map(emoji =>
                  `<button type="button" class="jitsi-hacks-emoji-button jitsi-hacks-${emoji.cssName}" data-url="${emoji.url}"></button>`
                ).join("")}
              </div>
            </main>
            <footer class="modal__footer">
              <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button>
            </footer>
          </div>
        </div>
      </div>
    `);

    $(".jitsi-hacks-emoji-button-container button").click(onEmojiButtonClick);
  }

  addMicroModalScript();
  addEmojiImageStyles();
  addEmojiReactionDialog();
  addEmojiReactionButton();

  APP.keyboardshortcut.registerShortcut('E', null, () => {
    showEmojiReactionDialog();
  }, "Emoji reaction");

  console.log("[Jitsi Hacks] Emoji Reaction script loaded.");
})();
