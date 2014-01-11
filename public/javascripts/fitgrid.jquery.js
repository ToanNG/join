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
        scenario: [
          {
            's1':'14'
          },
          {
            's1':'13',
            's2':'24'
          },
          {
            's1':'13',
            's2':'22',
            's3':'44'
          },
          {
            's1':'11',
            's2':'22',
            's3':'33',
            's4':'44'
          }
        ],

        add: function(html, callback) {
          if (grid.addedElem >= grid.maxElem) return false;
          $("<div class='fitgrid-slot'></div>")
            .appendTo(gridContainer)
            .append(html);
          $(".fitgrid-slot").each(function(index) {
            $(this).removeClass().addClass("fitgrid-slot slot--"+grid.scenario[grid.addedElem]["s"+(index+1)]);
          });
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