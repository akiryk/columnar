'use strict';

var timer,
    resizing;

var loremGenerator = {
  lorem: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod " +
        "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, " +
        "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo" +
        "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse " +
        "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat " +
        "non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  getlorem: function( s1, s2){
    return this.lorem.slice( s1, s2 );
  },
  getRandomSegment: function(min, max){
    var lorem = this.lorem,
        min = min ? min : 15,
        max = max ? max : lorem.length - 250;
    return this.getlorem( 0, Math.floor( Math.random() * max ) + min );
  }
}

var columnar = {

  totalColumns: $("#numcolumns").val(),

  init: function(){
    this.makeHtml();
    this.cacheVars();
    this.setColumns();
    this.createGuideGrid();
    this.initDragger();
  },

  onResize: function(){
    this.totalWidth = this.getTotalWidth();
    this.setColumns();
    this.redrawGridLines();
  },

  changeTotalColumns: function( cols ){
    console.log("change!");
    this.totalColumns = cols || 4;
    this.makeHtml();
    this.cacheVars();
    this.setColumns();
    this.initDragger();
  },

  cacheVars: function(){
    this.$currentColumn = null;
    this.$nextColumn = null;
    this.$colWrapper = $("#cell-wrapper");
    this.$columnList = $(".cell", this.$colWrapper);
    this.totalWidth = this.getTotalWidth();
    this.columnWidth = 1 / this.$columnList.length * 100 + "%";
    this.containmentOffset = 1/12 * this.totalWidth;
  },

  makeHtml: function( ){
    var markup = "",
        m = $("<div/>"),
        cols = this.totalColumns,
        rand,
        dragger = "<div class='dragger'><div class='handle'></div></div>",
        getCopy = loremGenerator.getRandomSegment.bind(loremGenerator);

    for (var i=0; i<cols-1; i++){
      markup += "<div class='cell'>" + dragger + "<div class='inner'><p><span class='outer-span'><span class='inner-span'>" + getCopy() + "</span></span></p></div></div>";
    }

    markup += "<div class='cell last'><div class='inner'><p><span class='outer-span'><span class='inner-span'>" + getCopy() + "</span></span></p></div></div>";

    $("#cell-wrapper").html(markup);
  },

  setColumns: function(){
    if ( this.totalColumns === 5 ) {
      this.columnWidth = 1/6 * 100 + "%";
    }

    // Set column widths
    this.$columnList.each( function(i, el){
      var $this = $(this),
          width = columnar.columnWidth,
          fixedWidth = $this.data("fixedWidth");

      if ( fixedWidth ) {
        width = fixedWidth + "px";
      } else if ( columnar.totalColumns === 5 && i === 4 ){
        width = 1/3 * 100 + "%";
      }

      $(this).css("flex-basis", width);

    });

  },

  createGuideGrid: function(){
    $(".line").each( function(i, el){
      var p = i/12 * columnar.totalWidth;
      $(this).css("left", p + "px");
    });
  },

  redrawGridLines: function(){
    var len = this.$columnList.length,
        $first = this.getFirstColumn(),
        $last = this.getLastColumn(),
        l = $first.data( "fixedWidth" ) ? $first.width() : 0,
        r = $last.data( "fixedWidth" ) ? $last.width() : 0,
        x; // left offset for each gridline
    $(".line").each( function(i, el){
      x = l + i/12 * ( columnar.totalWidth - l - r ) ;
      $(this).css("left", x + "px");
    });
  },

  initDragger: function(){
    var c = columnar;
    $(".dragger").each( 
      function( i, el) {
        var ca = c.getContainment($(this), i, c.totalColumns);
        $(this).draggable({
          axis: 'x',
          handle: '.handle',
          containment: ca,
          start: c.onDragStart,
          stop: c.onDragStop,
          drag: c.onDragMove,
        });
      }
    );
  },

  onDragStart: function( e, ui ) {
    var $this = $(this);
    $this.css("transform", "translateX(-3px)");
    columnar.$currentColumn = $this.closest(".cell");
    columnar.$nextColumn = columnar.$currentColumn.next();
    columnar.workingWidth = parseFloat(columnar.$currentColumn.css("flex-basis")) 
      + parseFloat(columnar.$nextColumn.css("flex-basis"));
  },

  onDragStop: function( e, ui ) {

    var closestGridLine = columnar.findClosestInjQueryObject(ui.offset.left, $(".line"), 16);
    var target = closestGridLine - $(this).parent().offset().left;
    $(this).animate(
      { left: target }, 
      { duration: 100, 
        easing: "swing", 
        complete: function(){
           $(this).css({
            "left": "auto",
            "right": "0",
            "transform": "translateX(3px)"
          });
        },
        progress: columnar.animateColumns,
      });

    columnar.setContainment();
  },

  onDragMove: function( e, ui ) {
    var percentage = (ui.position.left / columnar.getTotalWidth() ) * 100;
    columnar.updateActiveCells( percentage );
  },

  animateColumns: function(obj, b, c){
    var len = columnar.$columnList.length,
        $first = columnar.$columnList.eq(0),
        $last = columnar.$columnList.eq(len-1),
        l = $first.data( "fixedWidth" ) ? $first.width() : 0,
        r = $last.data( "fixedWidth" ) ? $last.width() : 0;

    var percentage = ($(this)[0].offsetLeft / ( columnar.totalWidth - l - r ) ) * 100;
    columnar.updateActiveCells( percentage );
  },

  updateActiveCells: function( percentage ){
    columnar.$currentColumn.css("flex-basis", percentage + "%");
    columnar.$nextColumn.css("flex-basis", (columnar.workingWidth - percentage) + "%");
  },

  /*
   * Find all fluid columns and return the sum of their widths 
   */
  getTotalWidth: function(){
    return this.$colWrapper.width();
  },

  getContainment: function( $dragger ){
    var $p = $dragger.parent(),
        $next = $p.next(),
        x1 = $p.offset().left + this.containmentOffset,
        x2 = $next.offset().left + $next.width() - this.containmentOffset;

    return [x1, 0, x2, 500];
  },

  /*
   * Contain the dragger based on left side of it's parent cell
   * and the right side of the next cell.
   */ 
  setContainment: function(){
    $(".dragger").each( 
      function( i, el) {
        var ca = columnar.getContainment($(this)); 
        $(this).draggable({containment: ca})
      }
    );
  },

  findClosestInjQueryObject: function( num, $obj, offset ){
    offset = offset === undefined ? 0 : offset;
    // look at every gridline
    var val,
        curr = $obj.eq(0).offset().left + offset;
    $obj.each( function(i, el){
      val = $(this).offset().left + offset;
      if ( Math.abs(num - val) < Math.abs(num - curr)) {
        curr = val;
      }
    });

    return curr;
  }

}

columnar.init();

(function setEvents(){
  $("#numcolumns").on("change", function(e){
    columnar.changeTotalColumns( e.currentTarget.value );
  });
})();


$(window).on("resize", function(){
  if (!resizing) {
    resizing = true;
    timer = setTimeout(function(){
      resizing = false;
      columnar.onResize();
    }, 500)
  }
});