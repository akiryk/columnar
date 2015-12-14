
  /** Grid View
   * The display of columns with drag handles
   */
  var GridView = (function(){
    'use strict';

    var $columns = $( "#columns");
    
    return {
    
      // e.g. a three column grid or a five column grid
      numColumns: Controller.getNumColumns(),

      // Number of divisions in background grid, e.g. 9 or 12 or 16.
      gridDivisions: Controller.getGridDivisions(),

      /** 
       * Initialize the Grid View
       */
      init: function(){
        this.createGuideGrid();
        this.renderColumns();
        this.setColumnWidths();
      },

      /**
       * Create interactive columns
       * Adds a '.column' element to the DOM, including the dragger class
       * which will be used by the dragger-ui plugin.
       */
      renderColumns: function(){
        var markup = '',
            dragger = "<div class='dragger'><div class='handle'></div></div>";

        for (var i=0; i<this.numColumns-1; i++){
          markup += "<div class='column'>" + dragger + "<div class='inner'></div></div>";
        }

        markup += "<div class='column last'><div class='inner'></div></div>";

        $columns.html( markup );

        this.styleInnerContent();      
      },

      styleInnerContent: function(){
        var px = (Controller.getGutterWidth() / 2) - 1 + "px";
        $( ".inner" ).css({
          "margin-left": px, 
          "margin-right": px 
        });
      },

      updateNumColumns: function(n){
        this.numColumns = n;
        this.renderColumns();
        this.setColumnWidths();
      },

      updateGutterWidth: function(w){
        this.renderGutter();
        this.styleInnerContent();
      },

      /**
       * Set width of each column element in DOM
       */
      setColumnWidths: function(){
        var $columnList = $( ".column", $columns );
        var cols = 12/this.numColumns;
        var cw = 1 / $columnList.length * 100 + "%";
        var numColumns = this.numColumns;

        if (numColumns == 5){
          cw = 1/6 * 100 + "%";
          cols = 2;
        }

        // Set column widths
        $columnList.each( function(i, el){
          var $this = $( this ),
              width = cw;
          if (numColumns == 5 && i == 4 ){
            width = 1/3 * 100 + "%";
          }

          $( this )
            .css( "flex-basis", width )
            .data({
              "startCol": cols * (i+1)
              });
        });
      },

      renderGutter: function(){

        var gutterPx = Controller.getGutterWidth();

        $( ".line", "#grid" ).css({
          "width": gutterPx + "px",
          "transform": "translateX(-" + gutterPx/2 + "px)"
        });

      },

      /**
       * Create vertical guidelines for the grid.
       * The guidelines are rendered by drawing left and right borders on boxes 
       * for which width = Model.gutterWidth. The left-most and right-most
       * boxes only have one border.
       */
      createGuideGrid: function(){
        
        // A container element we'll append to DOM.
        var $gridWrapper = $('<div class="grid" id="grid">');

        // Total width of the grid based on screen width.
        var totalWidth = Controller.getTotalWidth();

        var gd = this.gridDivisions;

        // Append line elements to grid that is still not part of DOM
        for (var i=0; i<gd+1; i++){
          $gridWrapper.append("<div class='line'></div>\n");
        }

        // Now attach the full set of guidelines to the DOM
        $columns.before( $gridWrapper );

        $( ".line" ).each( function(i, el){
          var p = i/gd * totalWidth;
          $( this ).css( "left", p + "px" );
        });
      }

    };

  })();