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

  function showLowerThirdDialog() {
    APP.UI.messageHandler.openDialog(
      "Lower third",
      `
      <div style="margin-bottom: 0.5em">
        <label for="lower-third-text">Text to display in lower third:</label>
      </div>
      <input class="input-control" type=text name="lower-third-text" id="lower-third-text" autofocus>
      `,
      false,
      {
        'Enable': true,
        'Cancel': false
      },
      (e, submitValue) => {
        if (submitValue) {
          let text = $('#lower-third-text').val();
          saveLowerThirdText(text);

          enableLowerThird();
        }
      },
      () => {
        $('#lower-third-text').val(lowerThirdEffect.text);
      }
    );
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

    $('div.button-group-right').prepend(toggleButton);
  }

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
