/**
 * FIT GRID
 * by Toan Nguyen
 */

(function($) {
  $.fitgrid = function(gridContainer) {
    var $gridContainer = $(gridContainer),
      grid = {
        maxElem: 4,
        addedElem: 0,
        wContainer: Math.round($gridContainer.width()),
        hContainer: Math.round($gridContainer.height()),

        add: function(html, callback) {
          $gridContainer.append("<div class='slot-"+grid.addedElem+"' style='width:"+grid.wContainer+"px; height:"+grid.hContainer+"px;'></div>");
          $(".slot-0").append(html);
          callback();
          grid.addedElem++;
        },

        remove: function(callback) {
          console.log(grid.maxElem);
        }
      };

    return {
        add: grid.add,
        remove: grid.remove
    };
  };
})(jQuery);