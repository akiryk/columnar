(function( $ ){

  'use strict';

  var workingWidth,
      columnWidth,
      $currentColumn,
      $nextColumn,
      $columnList,
      gutter = 32,
      gutterEms = gutter / 2,
      totalColumns = $( "#numcolumns" ).val(),
      $columns = $( "#columns" ),
      totalWidth = getTotalWidth(),
      containmentOffset = 1/12 * totalWidth,
      $pre = $( "#markup" ),
      $css = $( "#css" ),
      lorem = "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod " +
          "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
          "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo" +
          "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse " +
          "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat " +
          "non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  function init(){
    makeHtml();
    cacheVars();
    setGutter();
    setGutterEms();
    styleInnerContent();
    initColumns();
    createGuideGrid();
    initDraggers();
    setEvents();
  }

  function onResize(){
    totalWidth = getTotalWidth();
    redrawGridLines();
  }

  function cacheVars(){
    $columnList = $( ".cell", $columns );
    columnWidth = 1 / $columnList.length * 100 + "%";
  }

  function updateCachedVars(){
    cacheVars();
    if (totalColumns == 5){
      columnWidth = 1/6 * 100 + "%";
    }
  }

  function setGutter(){
    $( ".line", "#grid" ).css({
      "width": gutter + "px",
      "transform": "translateX(-" + gutter/2 + "px)"
    })
  }

  function styleInnerContent(){
    var px = gutter/2-1 + "px";
    $( ".inner" ).css({
      "margin-left": px, 
      "margin-right": px 
    });
  }

  function getlorem( s1, s2){
    return lorem.slice( s1, s2 );
  }

  function getRandomLoremIpsum(min, max){
    var min = min ? min : 15,
        max = max ? max : lorem.length - 250;
    return getlorem( 0, Math.floor( Math.random() * max ) + min );
  }

  function changeTotalColumns( cols ){
    totalColumns = cols || 4;
    makeHtml();
    updateCachedVars();
    initColumns();
    initDraggers();
  }

  function changeGutter( w ){
    gutter = w;
    setGutter();
    setGutterEms();
    styleInnerContent();
  }

  function setGutterEms(){
    gutterEms = gutter / 16;
    var ems = gutterEms === 1 ? gutterEms + "em" : gutterEms + "ems";
    $( "#gutterInEms" ).html( ems );
  }

  function makeHtml(){
    var markup = "",
        m = $( "<div/>" ),
        cols = totalColumns,
        rand,
        dragger = "<div class='dragger'><div class='handle'></div></div>";

    for (var i=0; i<cols-1; i++){
      markup += "<div class='cell'>" + dragger + "<div class='inner'><p><span class='outer-span'><span class='inner-span'>" + getRandomLoremIpsum() + "</span></span></p></div></div>";
    }

    markup += "<div class='cell last'><div class='inner'><p><span class='outer-span'><span class='inner-span'>" + getRandomLoremIpsum() + "</span></span></p></div></div>";

    $( "#columns" ).html( markup );
  }

  function initColumns(){
    var cols = 12/totalColumns;

    if ( totalColumns == 5 ) {
      columnWidth = 1/6 * 100 + "%";
      cols = 2;
    }

    // Set column widths
    $columnList.each( function(i, el){
      var $this = $( this ),
          width = columnWidth;

      if ( totalColumns == 5 && i == 4 ){
        width = 1/3 * 100 + "%";
      }

      $( this )
        .css( "flex-basis", width )
        .data({
          "startCol": cols * (i+1)
          });
    });
  }

  function createGuideGrid(){
    $( ".line" ).each( function(i, el){
      var p = i/12 * totalWidth;
      $( this ).css( "left", p + "px" );
    });
  }

  function redrawGridLines(){
    $( ".line" ).each( function( i, el ){
      $( this ).css( "left", (i/12 * totalWidth) + "px" );
    });
  }

  function initDraggers(){
    $( ".dragger" ).each( 
      function( i, el) {
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
  }

  function onDragStart( e, ui ) {
    var $this = $( this );
    $this.css( "transform", "translateX(-3px)" );
    $currentColumn = $this.closest( ".cell" );
    $nextColumn = $currentColumn.next();
    workingWidth = parseFloat($currentColumn.css( "flex-basis" )) 
      + parseFloat($nextColumn.css( "flex-basis" ));
  }

  function getPrevCols( $column ){
    console.log("prev " , $column.prev().data());
    return $column.prev().data("startCol");
  }

  function onDragStop( e, ui ) {
    var closestGridLine = findClosestInjQueryObject(ui.offset.left, $( ".line" ), gutter/2);
    var target = closestGridLine.x - $( this ).parent().offset().left;
    var basis = closestGridLine.id;
    var col = parseInt($(this).data("id") + 1);
    var prevCols = col > 1 ? getPrevCols( $(this).parent() ) : 0;
    $( this )
      .parent()
      .data({
        "startCol": basis
      });
    $( this ).animate(
      { left: target }, 
      { duration: 100, 
        easing: "swing", 
        complete: function(){
           $( this ).css({
            "left": "auto",
            "right": "0",
            "transform": "translateX(3px)"
          });
        },
        progress: animateColumns,
      });

    setContainment();
  }

  function onDragMove( e, ui ) {
    var percentage = (ui.position.left / getTotalWidth() ) * 100;
    updateActiveCells( percentage );
  }

  function animateColumns( obj, b, c ){
    var percentage = ( $( this )[0].offsetLeft / totalWidth  ) * 100;
    updateActiveCells( percentage );
  }

  function updateActiveCells( percentage ){
    $currentColumn.css( "flex-basis", percentage + "%" );
    $nextColumn.css( "flex-basis", (workingWidth - percentage) + "%" );
  }

  /*
   * Find all fluid columns and return the sum of their widths 
   */
  function getTotalWidth(){
    return $columns.width();
  }

  function getContainment( $dragger ){
    var $p = $dragger.parent(),
        $next = $p.next(),
        x1 = $p.offset().left + containmentOffset,
        x2 = $next.offset().left + $next.width() - containmentOffset;
    return [x1, 0, x2, 500];
  }

  function generateMarkup(){
    var classAttr = " <span class='attrname'>class</span>",
        propClass = "<span class='propname'>",
        containerClass = " class='container'",
        spanOpen = "<span",
        spanClose = "</span>";

    // for the html markup
    var divOpen = "&lt;<span class='tagname'>div</span>", // <div
        divClose = "&lt;<span class='tagname'>/div</span>&gt;", // </div>
        container = divOpen + classAttr + "=" + propClass + "'flex-container'" + spanClose + "&gt;",
        column1 = "  " + divOpen + classAttr + "=" + propClass + "'flex-column ",
        column2 = spanClose + "'&gt;" + // column open
             " some content " + // column content
             divClose + " \n", //column close
        html = "<code>" + container + "\n";

    // for the css 
    var class1 = "  .flex-container { \n" + 
               "    box-sizing: border-box;\n" +
               "    display: flex;\n" + 
               "    width: 100%;\n" + 
               "  }\n",
        class2a= "\n" + 
                 "  .flex-column",
        class2b= " { \n" + 
                 "    box-sizing: inherit;\n" +
                 "    flex: 0 0 ",
        class2c= "\n" + "    padding: 0 " + gutterEms + "em;",
        class2d= "\n" +
                 "  }\n",
        css = "<code>" + class1;

    var classesArr = [];

    $columnList.each( function( i, el){
      var a = $( this ).data("startCol"),
          b = i > 0 ? $( this ).prev().data("startCol") : 0,
          numColumns = Math.abs(a-b),
          w = (numColumns/12 * 100 ),
          colClass = "cols-" + numColumns;

      if ( classesArr.indexOf(colClass) == -1 ) {
        classesArr.push(colClass);
        var txt = class2a + "." + colClass + class2b + w + "%;" + class2c + class2d;
        css += txt;
      } 
      
      html += column1 + colClass + column2;
    });

    html += divClose + "</code>";
    $pre.html( html );

    css += "</code>";
    $css.html( css );

  }

  /*
   * Contain the dragger based on left side of it's parent cell
   * and the right side of the next cell.
   */ 
  function setContainment(){
    $( ".dragger" ).each( 
      function( i, el) {
        var ca = getContainment($( this )); 
        $( this ).draggable({containment: ca})
      }
    );
  }

  function findClosestInjQueryObject( num, $obj, offset ){
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


  function setEvents(){

    $( "#settings" ).on( "change", function(e){
      var targ = e.target,
          id = targ.getAttribute("id");
      switch ( id ) {
        case "gutter":
          changeGutter( targ.value );
          break;
        case "numcolumns":
          changeTotalColumns( targ.value );
          break;
      }
    });

    $( "#generate" ).on( "click", function(e) {
      e.preventDefault();
      generateMarkup();
    });
  }

  $( window ).on( "resize", onResize );

  init();

})(jQuery)