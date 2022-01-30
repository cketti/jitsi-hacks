if (!window.JitsiMeetJS) {
  console.log("[Jitsi Hacks] Couldn't find Jitsi Meet");
} else if (window.jitsiHacksVip) {
  console.log("[Jitsi Hacks] The script has already been loaded");
} else (function() {

  const orderOffset = -9999;
  let order;
  let vips;

  function addVipStyles() {
    $('head').append(`
      <style>
        .jitsi-hacks-vip-menu-item:hover {
          text-decoration: none;
        }
        #localVideoTileViewContainer {
          order: -10000;
        }
        .jitsi-hacks-vip-indicator {
          transform: translateY(5px);
          float: right;
          font-size: 10px;
          color: #fff;
        }
      </style>
    `);
  }

  function addVipMenuItem() {
    const targetNode = document.getElementsByClassName('filmstrip')[0];

    const observerConfig = { childList: true, subtree: true };
    const observer = new MutationObserver(onDomChanged);

    observer.observe(targetNode, observerConfig);
  }

  function onDomChanged(mutationsList, observer) {
    addVipEffectsIfNecessary();
    addVipMenuItemIfNecessary();
  }

  function addVipEffectsIfNecessary() {
    $('.filmstrip span.videocontainer:not(#localVideoContainer)').each(function() {
      const container = $(this);
      if (container.css('order') == '0') {
        const participant = getParticipantFromContainer(container);
        if (participant) {
          const displayName = participant.getDisplayName();
          if (vips.has(displayName)) {
            const order = vips.get(displayName);
            addVipEffects(container, order);
          }
        }
      }
    });
  }

  function addVipMenuItemIfNecessary() {
    const popupMenu = $('.filmstrip .popupmenu:not(:has(.jitsi-hacks-vip-menu-item))').first();
    if (popupMenu.length == 0) return;

    $(`
      <li class="popupmenu__item">
      <a class="popupmenu__link jitsi-hacks-vip-menu-item">
        <span class="popupmenu__icon">
          <div class="jitsi-icon">VIP</div>
        </span>
        <span class="popupmenu__text">Toggle VIP status</span>
      </a>
      </li>
    `)
    .click(onVipMenuItemClicked)
    .appendTo(popupMenu);
  }

  function onVipMenuItemClicked(event) {
    const container = $(event.target).parents('span.videocontainer').first();
    const participant = getParticipantFromContainer(container);
    if (!participant) {
      console.log("[Jitsi Hacks] Couldn't find participant with ID " + participantId);
      return;
    }

    const displayName = participant.getDisplayName();
    if (vips.has(displayName)) {
      vips.delete(displayName);
      removeVipEffects(container);
    } else {
      vips.set(displayName, order);
      addVipEffects(container, order);
      order++;
    }

    saveVips();
  }

  function getParticipantFromContainer(container) {
    const participantId = container[0].id.replace('participant_', '');
    return APP.conference.getParticipantById(participantId);
  }

  function removeVipEffects(container) {
    container.find('.jitsi-hacks-vip-indicator').remove();
    container.css('order', '0');
  }

  function addVipEffects(container, order) {
    const videoToolbar = container.find('.videocontainer__toolbar > div');
    videoToolbar.append('<div class="jitsi-hacks-vip-indicator">VIP</div>');
    container.css('order', order + orderOffset);
  }

  function saveVips() {
    const displayNames = [...vips].sort((first, second) => first[1] - second[1]).map(it => it[0]);
    const json = JSON.stringify(displayNames);
    window.localStorage.setItem("jitsiHacks/vip/vips", json);
  }

  function loadVips() {
    const displayNames = JSON.parse(window.localStorage.getItem("jitsiHacks/vip/vips"));
    if (displayNames) {
      vips = new Map(displayNames.map((displayName, index) => [displayName, index]));
    } else {
      vips = new Map();
    }
    order = vips.size;
  }

  loadVips();
  addVipStyles();
  addVipMenuItem();
  addVipEffectsIfNecessary();

  window.jitsiHacksVip = "0.2";

  console.log("[Jitsi Hacks] VIP script loaded.");
})();
