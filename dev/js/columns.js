var columnsLayout = (function(){

  'use strict';

  // private variables

  // cache some jquery objects
  var $columns = $( "#columns" ),
      $columnList,
      $currentColumn,
      $nextColumn;

  // cache some helpers
  var gutterPx = 32,
      gridColumns = 12,
      totalColumns = 4,
      totalWidth,
      containmentOffset,
      useLoremText = false,
      workingWidth,
      
      lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod " +
        "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
        "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo" +
        "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse " +
        "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat " +
        "non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  // private methods
  var getLorem = function( start, end ){
    return lorem.slice( start, end );
  };

  var getRandomLoremIpsum = function( min, max ){
    if ( !useLoremText ) return "";
    var min = min ? min : 15,
        max = max ? max : lorem.length - 250,
        lorem = getLorem( 0, Math.floor( Math.random() * max ) + min );
    return "<p><span class='outer-span'><span class='inner-span'>" + lorem + "</span></span></p>"
  };

  var createGuideGrid = function(){
    // var $gridWrapper = $('<div class="grid" id="grid">');
    // for (var i=0; i<gridColumns+1; i++){
    //   $gridWrapper.append("<div class='line'></div>\n");
    // }
    // $columns.before( $gridWrapper );
    // $( ".line" ).each( function(i, el){
    //   var p = i/12 * totalWidth;
    //   $( this ).css( "left", p + "px" );
    // });
  };

  var renderColumns = function(){
    var markup = "",
        cols = totalColumns,
        dragger = "<div class='dragger'><div class='handle'></div></div>";

    for (var i=0; i<cols-1; i++){
      markup += "<div class='column'>" + dragger + "<div class='inner'>" + getRandomLoremIpsum() + "</div></div>";
    }

    markup += "<div class='column last'><div class='inner'>" + getRandomLoremIpsum() + "</div></div>";

    $columns.html( markup );
  };

  var setColumnWidths = function(){
    var cols = 12/totalColumns;
    var cw = 1 / $columnList.length * 100 + "%";
    if (totalColumns == 5){
      cw = 1/6 * 100 + "%";
      cols = 2;
    }

    // Set column widths
    $columnList.each( function(i, el){
      var $this = $( this ),
          width = cw;

      if ( totalColumns == 5 && i == 4 ){
        width = 1/3 * 100 + "%";
      }

      $( this )
        .css( "flex-basis", width )
        .data({
          "startCol": cols * (i+1)
          });
    });
  };

  var setTotalWidth = function(){
    totalWidth = $columns.width();
  }

  var getTotalWidth = function(){
    return $columns.width();
  }

  var redrawGridLines = function(){
    $( ".line" ).each( function( i, el ){
      $( this ).css( "left", (i/12 * totalWidth) + "px" );
    });
  };

  var findClosestGridLine = function( num, $obj, offset ){
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

  var getContainment = function( $dragger ){
    var $p = $dragger.parent(),
        $next = $p.next(),
        x1 = $p.offset().left + containmentOffset,
        x2 = $next.offset().left + $next.width() - containmentOffset;
    return [x1, 0, x2, 500];
  };

  var initDraggers = function(){
    $( ".dragger" ).each( function( i, el){
      var ca = getContainment($( this ), i, totalColumns );
      $( this )
        .draggable({
          axis: 'x',
          handle: '.handle',
          containment: ca,
          start: onDragStart,
          stop: onDragStop,
          drag: onDragMove,
        })
        .data( "id", i );
      }
    );
  };

  var updateColumnVars = function(){
    $columnList = $( ".column", $columns );
    setTotalWidth();
    containmentOffset = 1/12 * totalWidth;
  }

  var renderGutter = function(){
    $( ".line", "#grid" ).css({
      "width": gutterPx + "px",
      "transform": "translateX(-" + gutterPx/2 + "px)"
    })
  }

  var styleInnerContent = function(){
    var px = gutterPx/2-1 + "px";
    $( ".inner" ).css({
      "margin-left": px, 
      "margin-right": px 
    });
  }

  var setContainment = function(){
    $( ".dragger" ).each( 
      function( i, el) {
        var ca = getContainment($( this )); 
        $( this ).draggable({containment: ca})
      }
    );
  }

  var onDragStart = function( e, ui ) {
    var $this = $( this );
    $this.css( "transform", "translateX(-3px)" );
    $currentColumn = $this.closest( ".column" );
    $nextColumn = $currentColumn.next();
    $currentColumn.toggleClass("highlight-right");
    $nextColumn.toggleClass("highlight-left");
    workingWidth = parseFloat($currentColumn.css( "flex-basis" )) 
      + parseFloat($nextColumn.css( "flex-basis" ));
  }

  var getPrevCols = function( $column ){
    return $column.prev().data("startCol");
  }

  var onDragStop = function( e, ui ) {
    var closestGridLine = findClosestGridLine(ui.offset.left, $( ".line" ), gutterPx/2),
        target = closestGridLine.x - $( this ).parent().offset().left,
        basis = closestGridLine.id,
        col = parseInt($(this).data("id") + 1),
        $this = $( this ),
        prevCols = col > 1 ? getPrevCols( $(this).parent() ) : 0;

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
          $currentColumn.toggleClass("highlight-right");
          $nextColumn.toggleClass("highlight-left");
          markupGenerator.generateMarkup( $columnList );
        },
        progress: animateColumns,
      });

    setContainment();
  }

  var onDragMove = function( e, ui ) {
    var percentage = (ui.position.left / getTotalWidth() ) * 100;
    updateActiveColumns( percentage );
  }

  var animateColumns = function( obj, b, c ){
    var percentage = ( $( this )[0].offsetLeft / totalWidth  ) * 100;
    updateActiveColumns( percentage );
  }

  var updateActiveColumns = function( percentage ){
    $currentColumn.css( "flex-basis", percentage + "%" );
    $nextColumn.css( "flex-basis", (workingWidth - percentage) + "%" );
  }

  // public methods
  return {

    init: function(){
      renderColumns();
      updateColumnVars();
      renderGutter();
      styleInnerContent();
      setColumnWidths();
      createGuideGrid();
      initDraggers();
    },

    changeGutterWidth: function( w ){
      gutterPx = w;
      renderGutter();
      styleInnerContent();
    },

    changeTotalColumns: function( cols ){
      totalColumns = cols || 4;
      renderColumns();
      updateColumnVars();
      setColumnWidths();
      initDraggers();
      if ( gutterPx !== 32 ) {
        renderGutter();
        styleInnerContent();
      }
    },

    onResize: function(){
      setTotalWidth();
      redrawGridLines();
    },

    getColumnList: function(){
      return $columnList;
    }

  };

})();

//columnsLayout.init();
