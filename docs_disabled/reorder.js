if (!window.JitsiMeetJS) {
  console.log("[Jitsi Hacks] Couldn't find Jitsi Meet");
} else if (window.jitsiHacksVip) {
  console.log("[Jitsi Hacks] The Reorder script can't be used if the VIP script has been loaded");
} else if (window.jitsiHacksReorder) {
  console.log("[Jitsi Hacks] The script has already been loaded");
} else (function() {

function addDragulaStyles() {
    $('head').append(`
        <style>
        .gu-mirror {
            position: fixed !important;
            margin: 0 !important;
            z-index: 9999 !important;
            opacity: 0.8;
            -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=80)";
            filter: alpha(opacity=80);
        }

        .gu-hide {
            display: none !important;
        }

        .gu-unselectable {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }

        .gu-transit {
            opacity: 0.2;
            -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=20)";
            filter: alpha(opacity=20);
        }
        </style>
    `);
}

function setupDragAndDrop() {
    let videoTiles;

    // Don't use jQuery functions to remove nodes. That will get rid of Jitsi's jQuery event listeners.
    function rewriteDomToDisplayOrder(container) {
        const jContainer = $(container);
        const children = jContainer.children();
        videoTiles = children.toArray();

        // Remove video tiles from DOM
        videoTiles.forEach(videoTile => videoTile.remove());

        // Sort video tile elements by display order (CSS 'order' property)
        const sortedTiles = videoTiles.slice().sort((a,b) => parseInt(a.style.order, 10) - parseInt(b.style.order, 10));

        // Add video tile elements in display order to DOM
        sortedTiles.forEach(videoTile => container.appendChild(videoTile));

        // Set CSS 'order' properties for all video tiles to 0
        jContainer.children().css('order', '0');
    }

    function restoreOriginalDomOrder(container) {
        const jChildren = $(container).children();
        const numberOfVideos = jChildren.length;

        // Set CSS 'order' properties to reflect current DOM order = display order
        jChildren.each(function(index) {
            $(this).css('order', -numberOfVideos + index);
        });

        // Remove video tiles from DOM
        videoTiles.forEach(videoTile => videoTile.remove());

        // Add video tiles to DOM in original order (now the CSS 'order' property is used for the display order)
        videoTiles.forEach(videoTile => container.appendChild(videoTile));

        videoTiles = null;
    }

    dragula([], {
        revertOnSpill: true,
        mirrorContainer: $('#filmstripRemoteVideosContainer')[0],
        isContainer: function (element) {
            // Only allow reordering in tile view
            return element.id == 'filmstripRemoteVideosContainer' && $(element).parents('.tile-view').length == 1;
        },
        moves: function (element, source, handle, sibling) {
            // Don't allow reordering while a popup is visible
            return $(handle).parents('.popover').length == 0;
        }
    }).on('drag', function (element, source) {
        rewriteDomToDisplayOrder(source);
    }).on('drop', function (element, target, source, sibling) {
        restoreOriginalDomOrder(target);
    }).on('cancel', function (element, container, source) {
        restoreOriginalDomOrder(container);
    });
}

function addDragulaScript(callback) {
    let script = document.createElement('script');
    script.src = 'https://jitsi-hacks.cketti.eu/dragula.min.js';
    script.addEventListener('load', callback);
    document.body.appendChild(script);
}

addDragulaStyles();
addDragulaScript(setupDragAndDrop);

window.jitsiHacksReorder = "0.2";

console.log("[Jitsi Hacks] Reorder script loaded.");
})();
