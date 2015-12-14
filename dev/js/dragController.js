  /**
   * Manage the dragger using jquery-ui
   */
  var DragController = (function(){
    'use strict';

    var $columns = $( "#columns");
    
    return {
      /** 
       * Cache some key variables
       */
      $currentColumn: null, // the column element being dragged.
      $nextColumn: null, // the next column to the right of currentColumn,
      workingWidth: 300, // width of column being dragged

      /**
       * Init Draggers 
       * Use jquery-ui to make draggable elements that can only
       * be dragged along horizontal axis
       */
      initDraggers: function(){
        
        var that = this;

        $( ".dragger" ).each( function( i, el){
          var ca = that.getDraggerContainment($( this ));
          $( this )
            .draggable({
              axis: 'x',
              handle: '.handle',
              containment: ca,
              start: that.onDragStart,
              stop: that.onDragStop,
              drag: that.onDragMove
            })
            .data( "id", i );
          }
        );

      },

      /**
       * Remove drag functionality from draggable elements
       */
      killDraggers: function(){
        $( ".dragger" ).draggable("destroy");
      },

      /**
       * Find the area in which dragger can move
       * @returns {array} x and y coords in which dragger can move
       */
      getDraggerContainment: function($dragger){
        var $p = $dragger.parent(),
            tw = Controller.getTotalWidth(),
            gd = Controller.getGridDivisions(),
            containmentOffset = 1/gd * tw,
            $next = $p.next();

        var x1 = $p.offset().left + containmentOffset,
            x2 = $next.offset().left + $next.width() - containmentOffset;

        return [x1, 0, x2, 500];
      },

      /**
       * Handle jquery-ui onDrag Start event by setting key variables.
       * @param {object} e - drag event
       * @param {object} ui - dragger DOM element
       */
      onDragStart: function( e, ui ) {
        var $this = $( this );
        $this.css( "transform", "translateX(-3px)" );
        DragController.$currentColumn = $this.closest( ".column" );
        DragController.$nextColumn = DragController.$currentColumn.next();
        DragController.$currentColumn.toggleClass("highlight-right");
        DragController.$nextColumn.toggleClass("highlight-left");
        DragController.workingWidth = parseFloat(DragController.$currentColumn.css( "flex-basis" )) +
          parseFloat(DragController.$nextColumn.css( "flex-basis" ));
      },

      /**
       * Move dragger to into alignment with gutter lines when dragging stops.
       * @param {object} e - drag event
       * @param {object} ui - dragger DOM element
       */
      onDragStop: function( e, ui ) {
        var closestGridLine = DragController.findClosestGridLine(ui.offset.left, $( ".line" ), Controller.getGutterWidth()/2),
            target = closestGridLine.x - $( this ).parent().offset().left,
            basis = closestGridLine.id,
            col = parseInt($(this).data("id") + 1),
            $this = $( this ),
            prevCols = col > 1 ? DragController.getPrevCols( $(this).parent() ) : 0;

        $this
          .parent()
          .data({
            "startCol": basis
          });
        $this.animate(
          { left: target }, 
          { duration: 100, 
            easing: "swing", 
            complete: function(){
              $this.css({
                "left": "auto",
                "right": "0",
                "transform": "translateX(3px)"
              });
              DragController.$currentColumn.toggleClass("highlight-right");
              DragController.$nextColumn.toggleClass("highlight-left");
              OutputController.updateColumnWidths();
            },
            progress: DragController.animateColumns,
          });

        DragController.setContainment();
      },

      /**
       * Make sure that the active columns resize according to dragger position.
       * @param {object} e - drag event
       * @param {object} ui - dragger DOM element
       */
      onDragMove: function( e, ui ) {
        var percentage = (ui.position.left / $columns.width() ) * 100;
        DragController.updateActiveColumns(percentage);
      },

      /**
       * Set the boundaries of where dragger can move
       */
      setContainment: function(){
        $( ".dragger" ).each( 
          function( i, el) {
            var ca = DragController.getDraggerContainment($( this )); 
            $( this ).draggable({containment: ca});
          }
        );
      },

      /**
       * Animate columns into alignment with background grid when dragging stops
       * @param {object} obj - the jquery-ui draggable object
       * @param {float}  b - count up from 0 to 1 in 9 steps
       * @param {float} c = count down from 100 to 0 in 9 steps
       */
      animateColumns: function( obj, b, c ){
        var percentage = ( $( this )[0].offsetLeft / $columns.width()  ) * 100;
        DragController.updateActiveColumns(percentage);
      },

      /**
       * Update column sizes to match dragger placement
       * @param {float} percentage - width of columns in percentages;
       */
      updateActiveColumns: function( percentage ){
        DragController.$currentColumn.css( "flex-basis", percentage + "%" );
        DragController.$nextColumn.css( "flex-basis", (DragController.workingWidth - percentage) + "%" );
      },

      /**
       * Find the column to left of active, dragging column
       * @param {jQuery object} $column - the actively dragged column
       */
      getPrevCols: function( $column ){
        return $column.prev().data("startCol");
      },

      /**
       * Find the background grid line closest to point where dragging stopped.
       * Use this to align dragger and dragged column with background grid.
       * @param {float} num - the offset.left of dragger handle
       * @param {jQuery object} $obj - the set of .line elements comprising background grid.
       * @param {Number} gw - half of the gutter width.
       * @returns {obj} - x position and id of the nearest grid line.
       */
      findClosestGridLine: function( num, $obj, gw ){
        var val,
            lineId,
            curr = $obj.eq(0).offset().left + gw;
        $obj.each( function(i, el){
          val = $( this ).offset().left + gw;
          if ( Math.abs(num - val) < Math.abs(num - curr)) {
            lineId = i;
            curr = val;
          }
        });

        return { x: curr, id: lineId };
      }

    };

  })();