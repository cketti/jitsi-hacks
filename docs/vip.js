if (!window.JitsiMeetJS) {
  console.log("[Jitsi Hacks] Couldn't find Jitsi Meet");
} else if (window.jitsiHacksVip) {
  console.log("[Jitsi Hacks] The script has already been loaded");
} else (function() {

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
    const targetNode = document.getElementsByClassName('filmstrip')[0];
    const elements = targetNode.getElementsByClassName('popupmenu');
    if (elements.length <= 0) return;

    const popupMenu = elements[0];
    const menuItems = popupMenu.getElementsByClassName('jitsi-hacks-vip-menu-item');
    if (menuItems.length > 0) return;

    const menuItem = $(`
      <li class="popupmenu__item">
      <a class="popupmenu__link jitsi-hacks-vip-menu-item">
        <span class="popupmenu__icon">
          <div class="jitsi-icon">VIP</div>
        </span>
        <span class="popupmenu__text">Toggle VIP status</span>
      </a>
      </li>
    `);

    menuItem.click(onVipMenuItemClicked)

    $(popupMenu).append(menuItem);
  }

  let order = -9999;

  function onVipMenuItemClicked(event) {
    const container = $(event.target).parents('span.videocontainer').first();
    const videoToolbar = container.find('.videocontainer__toolbar > div')
    if (container.css('order') != '0') {
      videoToolbar.find('.jitsi-hacks-vip-indicator').remove();
      container.css('order', '0');
    } else {
      videoToolbar.append('<div class="jitsi-hacks-vip-indicator">VIP</div>');
      container.css('order', order);
      order++;
    }

    //const participantId = container[0].id.replace('participant_', '');
    //console.log("[Jitsi Hacks]: Toggled VIP status for: " + participantId);
  }

  addVipStyles();
  addVipMenuItem();

  window.jitsiHacksVip = "0.1";

  console.log("[Jitsi Hacks] VIP script loaded.");
})();
