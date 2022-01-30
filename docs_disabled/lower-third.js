if (!window.JitsiMeetJS) {
  console.log("[Jitsi Hacks] Couldn't find Jitsi Meet");
} else if (window.jitsiHacks) {
  console.log("[Jitsi Hacks] A Jitsi Hacks script has been loaded already");
} else (function() {
  // Copied from https://github.com/jitsi/jitsi-meet/blob/a7de8be0aaf0e1d4ce9252fcd56e47a76e5c1966/react/features/stream-effects/presenter/TimeWorker.js
  /**
   * SET_INTERVAL constant is used to set interval and it is set in
   * the id property of the request.data property. timeMs property must
   * also be set. request.data example:
   *
   * {
   *      id: SET_INTERVAL,
   *      timeMs: 33
   * }
   */
  const SET_INTERVAL = 1;

  /**
   * CLEAR_INTERVAL constant is used to clear the interval and it is set in
   * the id property of the request.data property.
   *
   * {
   *      id: CLEAR_INTERVAL
   * }
   */
  const CLEAR_INTERVAL = 2;

  /**
   * INTERVAL_TIMEOUT constant is used as response and it is set in the id
   * property.
   *
   * {
   *      id: INTERVAL_TIMEOUT
   * }
   */
  const INTERVAL_TIMEOUT = 3;

  /**
   * The following code is needed as string to create a URL from a Blob.
   * The URL is then passed to a WebWorker. Reason for this is to enable
   * use of setInterval that is not throttled when tab is inactive.
   */
  const code = `
      var timer;
      onmessage = function(request) {
          switch (request.data.id) {
          case ${SET_INTERVAL}: {
              timer = setInterval(() => {
                  postMessage({ id: ${INTERVAL_TIMEOUT} });
              }, request.data.timeMs);
              break;
          }
          case ${CLEAR_INTERVAL}: {
              if (timer) {
                  clearInterval(timer);
              }
              break;
          }
          }
      };
  `;

  const timerWorkerScript
      = URL.createObjectURL(new Blob([ code ], { type: 'application/javascript' }));


  // Based on https://github.com/jitsi/jitsi-meet/blob/a7de8be0aaf0e1d4ce9252fcd56e47a76e5c1966/react/features/stream-effects/presenter/JitsiStreamPresenterEffect.js
  class LowerThirdEffect {
    constructor(text = "https://jitsi-hacks.cketti.eu") {
      this.text = text;
      this._canvas = document.createElement('canvas');
      this._ctx = this._canvas.getContext('2d');

      const videoDiv = document.createElement('div');
      videoDiv.style.display = 'none';

      this._videoElement = document.createElement('video');
      videoDiv.appendChild(this._videoElement);

      if (document.body !== null) {
        document.body.appendChild(videoDiv);
      }

      // Bind event handler so it is only bound once for every instance.
      this._onVideoFrameTimer = this._onVideoFrameTimer.bind(this);
    }

    /**
    * EventHandler onmessage for the videoFrameTimerWorker WebWorker.
    *
    * @private
    * @param {EventHandler} response - The onmessage EventHandler parameter.
    * @returns {void}
    */
    _onVideoFrameTimer(response) {
      if (response.data.id === INTERVAL_TIMEOUT) {
        this._renderVideo();
      }
    }

    /**
     * Loop function to render the video frame input and canvas effect.
     *
     * @private
     * @returns {void}
     */
    _renderVideo() {
      this._ctx.drawImage(this._videoElement, 0, 0, this._canvas.width, this._canvas.height);

      this._ctx.save();

      this._ctx.globalAlpha = 0.4;
      this._ctx.fillStyle = "#fff";
      let width = this._canvas.width;
      let height = 100;
      this._ctx.fillRect(0, this._canvas.height - 130, width, height);

      this._ctx.globalAlpha = 0.9;
      this._ctx.fillStyle = "#000";
      this._ctx.font = "56pt Arial";
      this._ctx.fillText(this.text, 50, this._canvas.height - 55);

      this._ctx.restore();
    }

    /**
     * Checks if the local track supports this effect.
     *
     * @param {JitsiLocalTrack} jitsiLocalTrack - Track to apply effect.
     * @returns {boolean} - Returns true if this effect can run on the
     * specified track, false otherwise.
     */
    isEnabled(jitsiLocalTrack) {
      return jitsiLocalTrack.isVideoTrack() && jitsiLocalTrack.videoType != 'desktop';
    }

    /**
     * Starts loop to capture video frame and render canvas effect.
     *
     * @param {MediaStream} videoStream - Stream to be used for processing.
     * @returns {MediaStream} - The stream with the applied effect.
     */
    startEffect(videoStream) {
      const firstVideoTrack = videoStream.getVideoTracks()[0];
      const { height, width, frameRate } = firstVideoTrack.getSettings() ?? firstVideoTrack.getConstraints();

      this._frameRate = frameRate;

      // set the video element properties.
      this._videoStream = videoStream;
      this._videoElement.width = parseInt(width, 10);
      this._videoElement.height = parseInt(height, 10);
      this._videoElement.autoplay = true;
      this._videoElement.srcObject = videoStream;
      this._canvas.width = parseInt(width, 10);
      this._canvas.height = parseInt(height, 10);
      this._videoFrameTimerWorker = new Worker(timerWorkerScript, { name: '[jitsi-hacks] Lower Third worker' });
      this._videoFrameTimerWorker.onmessage = this._onVideoFrameTimer;
      this._videoFrameTimerWorker.postMessage({
        id: SET_INTERVAL,
        timeMs: 1000 / this._frameRate
      });

      return this._canvas.captureStream(this._frameRate);
    }

    /**
     * Stops the capture and render loop.
     *
     * @returns {void}
     */
    stopEffect() {
      console.log("[Jitsi Hacks] stopEffect()")
      this._videoFrameTimerWorker.postMessage({
        id: CLEAR_INTERVAL
      });
      this._videoFrameTimerWorker.terminate();
    }
  }


  let toggleButton;
  let shouldShowLowerThird = false;
  const lowerThirdEffect = new LowerThirdEffect();

  let text = window.localStorage.getItem("jitsiHacks/lowerThird/text");
  if (text) {
    lowerThirdEffect.text = text;
  }

  function saveLowerThirdText(text) {
    lowerThirdEffect.text = text;
    window.localStorage.setItem("jitsiHacks/lowerThird/text", text);
  }

  function enableLowerThird() {
    toggleButton.attr('aria-pressed', 'true');
    toggleButton.find('.toolbox-icon').addClass('toggled');

    if (APP.conference.localVideo && lowerThirdEffect.isEnabled(APP.conference.localVideo)) {
      shouldShowLowerThird = false;
      console.log("[Jitsi Hacks] Enabling lower third…");
      APP.conference.localVideo.setEffect(lowerThirdEffect);
    } else {
      shouldShowLowerThird = true;
    }
  }

  function disableLowerThird() {
    shouldShowLowerThird = false;
    toggleButton.attr('aria-pressed', 'false');
    toggleButton.find('.toolbox-icon').removeClass('toggled');

    if (APP.conference.localVideo) {
      APP.conference.localVideo.setEffect();
      console.log("[Jitsi Hacks] Disabled lower third");
    }
    shouldShowLowerThird = false;
  }

  function isLowerThirdEnabled() {
    return toggleButton.attr('aria-pressed') == 'true';
  }

  function toggleLowerThird() {
    if (isLowerThirdEnabled()) {
      disableLowerThird();
    } else {
      enableLowerThird();
    }
  }

  function addLowerThirdStyles() {
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
          min-width: 30em;
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
        .modal__btn_primary {
          margin-right: 5px;
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
          background: rgb(76, 154, 255);
          cursor: pointer;
          height: 2.28571em;
          line-height: 2.28571em;
          padding: 0px 10px;
          vertical-align: middle;
          width: auto;
          -webkit-box-pack: center;
          justify-content: center;
          color: rgb(27, 38, 56) !important;
        }
        .modal__btn_primary:focus, .modal__btn_primary:hover {
          background: rgb(179, 212, 255);
          text-decoration: inherit;
          transition-duration: 0s, 0.15s;
          color: rgb(27, 38, 56) !important;
        }
        .modal__btn_primary:active {
          background: rgb(38, 132, 255);
          transition-duration: 0s, 0s;
          color: rgb(27, 38, 56) !important;
        }
      </style>
    `);
  }

  function showLowerThirdDialog() {
    $('#lower-third-text').val(lowerThirdEffect.text);
    
    MicroModal.show('modal-lower-third');
  }

  function onLowerThirdEnabled() {
    let text = $('#lower-third-text').val();
    saveLowerThirdText(text);

    enableLowerThird();
  }

  function onToggleButtonClick() {
    if (isLowerThirdEnabled()) {
      disableLowerThird();
    } else {
      showLowerThirdDialog();
    }
  }

  function addLowerThirdToggleButton() {
    toggleButton = $(`
      <div id="jitsi-hacks-lower-third" aria-pressed="false" aria-disabled="false"
          aria-label="Toggle lower third" class="toolbox-button" tabindex="0" role="button" title="Toggle lower third">
        <div>
          <div class="toolbox-icon">
            <div class="jitsi-icon">L</div>
          </div>
        </div>
      </div>
    `);

    toggleButton.click(onToggleButtonClick);

    $('div.toolbox-button-wth-dialog').before(toggleButton);
  }
  
  function addLowerThirdDialog() {
    $(document.body).append(`
      <div class="modal micromodal-slide" id="modal-lower-third" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" data-micromodal-close>
          <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-lower-third-title">
            <header class="modal__header">
              <h2 class="modal__title" id="modal-lower-third-title">Lower Third</h2>
              <button class="modal__close" aria-label="Close modal" data-micromodal-close>
                <svg height="22" width="22" viewBox="0 0 24 24" data-micromodal-close><path d="M18.984 6.422L13.406 12l5.578 5.578-1.406 1.406L12 13.406l-5.578 5.578-1.406-1.406L10.594 12 5.016 6.422l1.406-1.406L12 10.594l5.578-5.578z"></path></svg>
              </button>
            </header>
            <main class="modal__content" id="modal-lower-third-content">
              <div style="margin-bottom: 0.5em">
                <label for="lower-third-text">Text to display in lower third:</label>
              </div>
              <input class="input-control" type=text name="lower-third-text" id="lower-third-text" autofocus>
            </main>
            <footer class="modal__footer">
              <button id="lower-third-enable-button" class="modal__btn modal__btn_primary" data-micromodal-close aria-label="Enable lower third">Enable</button>
              <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button>
            </footer>
          </div>
        </div>
      </div>
    `);
    
    $('#lower-third-enable-button').click(onLowerThirdEnabled);
  }
  
  function addMicroModalScript() {
      let script = document.createElement('script');
      script.src = 'https://jitsi-hacks.cketti.eu/micromodal.min.js';
      document.body.appendChild(script);
  }

  addMicroModalScript();
  addLowerThirdStyles();
  addLowerThirdDialog();
  addLowerThirdToggleButton();

  APP.keyboardshortcut.registerShortcut('L', null, () => {
    toggleLowerThird();
  }, "Toggle lower third");

  APP.store.subscribe(() => {
    if (shouldShowLowerThird && APP.conference.localVideo) {
      enableLowerThird();
    }
  });

  window.jitsiHacks = {
    'api': 0,
    'lowerThird': {
      'version': '0.1'
    }
  }

  console.log("[Jitsi Hacks] Lower Third script loaded.")
})();
