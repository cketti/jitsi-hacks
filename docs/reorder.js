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

    // Don't use jQuery's methods to remove nodes. That will get rid of Jitsi's event listeners.
    dragula([], {
        revertOnSpill: true,
        mirrorContainer: $('#filmstripRemoteVideosContainer')[0],
        isContainer: function (element) {
            // Only allow reordering in tile view
            return element.id == 'filmstripRemoteVideosContainer' && $(element).parents('.tile-view').length == 1;
        }
    }).on('drag', function (element, source) {
        const jSource = $(source);
        const children = jSource.children();
        videoTiles = children.toArray();

        // Remove video tiles from DOM
        videoTiles.forEach(videoTile => videoTile.remove());

        // Sort video tile elements by display order (CSS 'order' property)
        const sortedTiles = videoTiles.slice().sort((a,b) => parseInt(a.style.order, 10) - parseInt(b.style.order, 10));

        // Add video tile elements in display order to DOM
        sortedTiles.forEach(videoTile => source.appendChild(videoTile));

        // Set CSS 'order' properties for all video tiles to 0
        jSource.children().css('order', '0');
    }).on('drop', function (element, target, source, sibling) {
        const jChildren = $(target).children();
        const numberOfVideos = jChildren.length;

        // Set CSS 'order' properties to reflect current DOM order = display order
        jChildren.each(function(index) {
            $(this).css('order', -numberOfVideos - 1 + index);
        });

        // Remove video tiles from DOM
        videoTiles.forEach(videoTile => videoTile.remove());

        // Add video tiles to DOM in original order (now the CSS 'order' property is used for the display order)
        videoTiles.forEach(videoTile => target.appendChild(videoTile));
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

window.jitsiHacksReorder = "0.1";

console.log("[Jitsi Hacks] Reorder script loaded.");
})();
