/**
 * Columnar main.js
 */

(function setEvents(){

  'use strict';

  /**
   * Cache references to some DOM elements
   */
  var numColsOutput = document.getElementById('num-columns-output'),
      numcolumns = document.getElementById('numcolumns'),
      gutterWidth = document.getElementById('gutter-width'),
      gutterWidthOutput = document.getElementById('num-ems-output'),
      settings = document.getElementById('settings'),
      $columns = $( "#columns" );

  /**
   * Model for the grid, e.g. number of columns, gutter-width, columns-width;
   */
  var Model = {

    numColumns: 4,
    gutterWidth: 32,
    gridDivisions: 12,
    addPrefixes: false,
    columns: [ null, null, null, null ] // array of column objects

  };

  var Controller = {

    init: function(){

      var that = this;

      // Add correct numbers to control panel
      numColsOutput.innerHTML = Model.numColumns;
      gutterWidthOutput.innerHTML = Model.gutterWidth + 'px';

      this.initEvents();

      GridView.init();

      // init draggers only once they've been rendered by GridView.init();
      DragController.initDraggers(); 

    },

    initEvents: function(){
      var that = this;
      settings.addEventListener( "change", function(e){
        var targ = e.target,
            id = targ.getAttribute("id"),
            val = targ.value;
        switch ( true ) {
          case (id == "gutter-width"):
            that.setGutterWidth(val);
            columnsLayout.changeGutterWidth( val );
            markupGenerator.changePaddingWidth( val );
            break;
          case (id == "numcolumns"):
            that.setNumColumns(val);
            //columnsLayout.changeTotalColumns(val);
            break;

          case (/^prefix/.test(id)):
            var addPrefixes = val == "yes" ? true : false;
            markupGenerator.setPrefixing( addPrefixes );
            generateMarkup();
        }
      });
    }, 

    getNumColumns: function(){
      return Model.numColumns;
    },

    setNumColumns: function(n){
      Model.numColumns = n;
      SettingsView.updateNumColumns(n);
    },

    getGutterWidth: function(){
      return Model.gutterWidth;
    },

    setGutterWidth: function(w){
      Model.gutterWidth = w;
      SettingsView.updateGutterWidth(w);
    },

    getGridDivisions: function(){
      return Model.gridDivisions;
    },

    getPrefixSetting: function(){
      return Model.addPrefixes;
    },

    setPrefixSetting: function(b){
      Model.addPrefixes = b;
    },

    getTotalWidth: function(){
      return $columns.width();
    }
  };

  var SettingsView = {

    updateNumColumns: function(n){
      numColsOutput.innerHTML = n;
      return this;
    },

    updateGutterWidth: function(w){
      gutterWidthOutput.innerHTML = w + "px";
      return this;
    }

  };

  var GridView = {

    numColumns: Controller.getNumColumns(),

    gridDivisions: Controller.getGridDivisions(),

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

      var gutterPx = Controller.getGutterWidth();
      var px = gutterPx/2-1 + "px";
      $( ".inner" ).css({
        "margin-left": px, 
        "margin-right": px 
      });
    },

    renderGutter: function(){
      $( ".line", "#grid" ).css({
        "width": gutterPx + "px",
        "transform": "translateX(-" + gutterPx/2 + "px)"
      });
    },

    setColumnWidths: function(){
      var $columnList = $( ".column", $columns );
      var cols = 12/this.numColumns;
      var cw = 1 / $columnList.length * 100 + "%";
      if (this.numColumns == 5){
        cw = 1/6 * 100 + "%";
        cols = 2;
      }

      // Set column widths
      $columnList.each( function(i, el){
        var $this = $( this ),
            width = cw;

        if ( this.numColumns == 5 && i == 4 ){
          width = 1/3 * 100 + "%";
        }

        $( this )
          .css( "flex-basis", width )
          .data({
            "startCol": cols * (i+1)
            });
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
    },

  };

  var DragController = {

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
            // markupGenerator.generateMarkup( $columnList );
          },
          progress: DragController.animateColumns,
        });

      DragController.setContainment();
    },

    onDragMove: function( e, ui ) {
      var percentage = (ui.position.left / $columns.width() ) * 100;
      DragController.updateActiveColumns( percentage );
    },

    setContainment: function(){
      $( ".dragger" ).each( 
        function( i, el) {
          var ca = DragController.getDraggerContainment($( this )); 
          $( this ).draggable({containment: ca})
        }
      );
    },

    animateColumns: function( obj, b, c ){
      var percentage = ( $( this )[0].offsetLeft / $columns.width()  ) * 100;
      DragController.updateActiveColumns( percentage );
    },

    updateActiveColumns: function( percentage ){
      DragController.$currentColumn.css( "flex-basis", percentage + "%" );
      DragController.$nextColumn.css( "flex-basis", (DragController.workingWidth - percentage) + "%" );
    },

    getPrevCols: function( $column ){
      return $column.prev().data("startCol");
    },

    findClosestGridLine: function( num, $obj, offset ){
      offset = offset === undefined ? 0 : offset;
      // look at every gridline
      var val,
          lineId,
          curr = $obj.eq(0).offset().left + offset;
      $obj.each( function(i, el){
        val = $( this ).offset().left + offset;
        if ( Math.abs(num - val) < Math.abs(num - curr)) {
          lineId = i;
          curr = val;
        }
      });

      return { x: curr, id: lineId };
    }

  };

  Controller.init();


  //window.addEventListener( "resize", columnsLayout.onResize );

  //generateMarkup();

})();