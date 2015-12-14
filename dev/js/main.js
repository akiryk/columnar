/**
 * Columnar main.js
 */

(function setEvents(){

  'use strict';

  /**
   * Cache reference to key DOM elements
   */
  var $columns = $( "#columns" ); // the container of columns

  /**
   * Model for the grid, e.g. number of columns, gutter-width, columns-width;
   */
  var Model = {

    numColumns: 4,
    gutterWidth: 32,
    gridDivisions: 12,
    addPrefixes: false

  };

  /**
   * Controller for the column grid app
   */
  var Controller = {

    /**
     * Initialize the controller 
     * 1. Setting events 
     * 2. Tell the grid to render.
     * 3. Instantiate jquery-ui dragger
     */
    init: function(){

      var that = this;

      SettingsView.init();

      this.initEvents();

      GridView.init();

      // init draggers only once they've been rendered by GridView.init();
      DragController.initDraggers(); 

      OutputController.init();

    },

    /**
     * Add event listener to the UI using event delegation.
     */
    initEvents: function(){
      var that = this,
          settings = document.getElementById('settings');

      settings.addEventListener( "change", function(e){
        
        var targ = e.target,
            id = targ.getAttribute("id"),
            val = targ.value;
        
        switch ( true ) {

          // Gutter-width settings have been changed
          case (id == "gutter-width"):
            that.setGutterWidth(val);
            break;

          // Number of columns has been changed
          case (id == "numcolumns"):
            that.setNumColumns(val);
            break;

          // Add CSS prefixes setting has changed (id is begins with "prefix")
          case (/^prefix/.test(id)):
            var addPrefixes = val == "yes" ? true : false;
            that.setPrefixSetting(addPrefixes);
        }
      });
    }, 

    getNumColumns: function(){
      return Model.numColumns;
    },

    setNumColumns: function(n){
      Model.numColumns = n;
      SettingsView.updateNumColumns(n);

      // Remove the old draggers from memory. Is this necessary?
      DragController.killDraggers();

      GridView.updateNumColumns(n);
      DragController.initDraggers();
      OutputController.updateNumColumns(n);

    },

    getGutterWidth: function(){
      return Model.gutterWidth;
    },

    setGutterWidth: function(w){
      Model.gutterWidth = w;
      SettingsView.updateGutterWidth(w);
      GridView.updateGutterWidth(w);
      OutputController.updateGutterWidth(w);
    },

    getGridDivisions: function(){
      return Model.gridDivisions;
    },

    getPrefixSetting: function(){
      return Model.addPrefixes;
    },

    setPrefixSetting: function(b){
      Model.addPrefixes = b;
      OutputController.setPrefixing(b);
    },

    getTotalWidth: function(){
      return $columns.width();
    }
  };

  /**
   * Settings View 
   * The portion of UI where users modify  grid and the output to HTML and CSS.
   */
  var SettingsView = {

    numColsOutput: document.getElementById('num-columns-output'),
    gutterWidthOutput: document.getElementById('num-ems-output'),

    init: function(){
       // Add correct numbers to control panel
      this.numColsOutput.innerHTML = Controller.getNumColumns();
      this.gutterWidthOutput.innerHTML = Controller.getGutterWidth() + 'px';
    },

    updateNumColumns: function(n){
      this.numColsOutput.innerHTML = n;
      return this;
    },

    updateGutterWidth: function(w){
      this.gutterWidthOutput.innerHTML = w + "px";
      return this;
    }

  };

  /** Grid View
   * The display of columns with drag handles
   */
  var GridView = {

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
    },

  };

  /**
   * Manage the dragger using jquery-ui
   */
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
          $( this ).draggable({containment: ca})
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


  /**
   * Output Controller
   * Display HTML and CSS markup to achieve the grid that a 
   * user creates by dragging the columns.
   */
  var OutputController = (function(){

    // Private vars
    var gutterEms = 2;

    // Private helper functions for creating the markup
    var getStartTagOpen = function( tagname, indents ){
      var indents = indents || 0,
          spaces = "";
      for (var i=0; i<indents; i++){
        spaces += " ";
      }
      return  spaces + "&lt;<span class='tagname'>" + tagname + "</span>";
    };

    var getStartTagClose = function(){
      return "</span>&gt;";
    }

    /*
     * return a <span> fragment with a class, 
     * e.g. <span class='someclass'>
     */
    var getSpanClass = function( classname){
      return "<span class=" + classname + ">";
    }

    var getAttr = function( attr ){
      return getSpanClass("attrname") + attr + "</span>";
    }

    var getEndTag = function( tagname ){
        return "&lt;<span class='tagname'>/" + tagname + "</span>&gt;";
    };

    var getCss = function( options ){
      var defaults = {
        classname: "some-class",
        props: {}
      };
      var settings = $.extend({}, defaults, options);
      var css = getClassName( settings.classname ) + " {\n";
      var value;

      for (var prop in settings.props){
        value = settings.props[prop];
        if ( Array.isArray( value )){
          css += getRulesFromArrayOfValues( prop, value );
        } else {
          css += "  " + getSpanClass("propname") + prop + "</span>: " + getSpanClass("valuename") + value + "</span>;\n";
        }
      }

      css += "}\n\n";
      return css;
    };

    var getEl = function( options ){
      var defaults = {
        indent: 0, // number of spaces
        tag: "div",
        classes: [],
        innerText: ""
      };
      var settings = $.extend({}, defaults, options);
      var txt = getStartTagOpen( settings.tag, settings.indent );
      if (settings.classes.length){
        txt += " " + getAttr("class") + "='" + getSpanClass("classname") + settings.classes.join(" ") + "'"; 
      }
      txt += getStartTagClose(); // >

      if (settings.innerText){
        txt += "\n" + "    " + settings.innerText + "\n" + "  " + getEndTag( "div" );
      }
      return txt + "\n";
    };

    /*
     * return a css class wrapped in a span, 
     * e.g. <span class='classname'>.some-class</span>
     */
    var getClassName = function ( classname ){
      return "<span class='classname'>" + "." + classname + "</span>";
    }

    /*
     * Return a string containing a property name and value
     */
    var getRulesFromArrayOfValues = function( propertyName, values ){
      var css = "";
      for (var i=0; i<values.length; i++){
        css += "  " + getSpanClass("propname") + propertyName + "</span>: " + getSpanClass("valuename") + values[i] + "</span>;\n";
      }
      return css;
    };

    var changePaddingWidth = function( n ){
      gutterEms = n/16;
    };

    var getColumnList = function(){
      return $( ".column", $columns );
    };

    var addPrefixes = Controller.getPrefixSetting();

    // public methods
    return {

      $columnList: null,

      init: function(){
        this.$columnList = $( ".column", $columns );
        this.renderMarkup();
      },

      setPrefixing: function( bool ){
        addPrefixes = bool;
        this.renderMarkup();
      },

      updateGutterWidth: function(w){
        changePaddingWidth(w);
        this.renderMarkup();
      },

      updateNumColumns: function(n){
        this.$columnList = getColumnList();
        this.renderMarkup();
      },

      updateColumnWidths: function(){
        this.$columnList = getColumnList();
        this.renderMarkup();
      },

      /** 
        * @desc Create html and css markup for users to copy and paste
        * @param $cellList is a jquery object of columns in the grid. 
        * We use it to determine width and other properties of our grid columns.
      */
      renderMarkup: function(){
        var html = "",
            css  = "",
            displayArr = [ "flex" ];

        var $columnList = this.$columnList;

        // create <div class="flex-container">
        html += getEl({ 
                  indent: 0,
                  tag: "div", 
                  classes: ["flex-container"],
                });

        // create .flex-container { ... }
        if ( addPrefixes ){
          displayArr.unshift(  "-webkit-flex", "-ms-flex" );
        }
    
        css += getCss( {  classname: "flex-container",
                      props: { 
                        "box-sizing": "border-box", 
                        "display": displayArr,
                        "width": "100%"
                      }
                    } );

        // create .flex-cell { ... }
        css += getCss( {
                      classname: "flex-cell",
                      props: { 
                        "box-sizing": "inherit", 
                        "padding": "0 " + gutterEms/2 + "em;",
                      }
                    } )

        var classesArr = [];

        // Create html and css based on number of cells and their parameters
        $columnList.each( function( i, el){
          // get the width of each column in grid units (e.g. a 2 column )
          var columnStart = i > 0 ? $( this ).prev().data("startCol") : 0,
              columnEnd = $( this ).data("startCol"),
              numColumns = Math.abs(columnEnd - columnStart),
              w = (numColumns/12 * 100 ),
              colClass = "cols-" + numColumns;

          if ( classesArr.indexOf(colClass) == -1 ) {
            classesArr.push(colClass);
            var properties = { "flex": "0 0 " + w + "%" };
            if ( addPrefixes ){
              properties = { 
                            "-webkit-flex":"0 0 " + w + "%", 
                            "-ms-flex":"    0 0 " + w + "%",
                            "flex":"        0 0 " + w + "%", 
                          }
            }

            css += getCss( {
                          classname: "flex-cell." + colClass,
                          props: properties,
                        } );
          } 
          
          html += getEl({ 
                    indent: 2, 
                    tag: "div", 
                    classes: ["flex-cell", colClass],
                    innerText: "some content"
                  });
        });

        html += getEndTag( "div" );

        OutputView.render(html, css);

      },

    };

  })();

  /**
   * Output View
   */
  var OutputView = {

    $markup: null,

    $css: null,

    render: function( html, css ){
      
      var $css,
      $output = $( "#output" );

      if ( !this.$markup ){
        $output.append('<div class="output-text"><h2 class="settings-title">Your HTML</h2><pre><code id="markup"></code></pre></div>');
        $output.append('<div class="output-text"><h2 class="settings-title">Your CSS</h2><pre><code id="css"></code></pre></div>');
        this.$markup = $( "#markup" );
        this.$css = $( "#css" );
      }

      this.$markup.html( html );
      this.$css.html( css );
    }
  };

  Controller.init();


  //window.addEventListener( "resize", columnsLayout.onResize );

  //generateMarkup();

})();