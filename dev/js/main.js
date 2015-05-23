'use strict';

/*
 * When you change the width to fixed and set a new number in
 * the input field, the flex-basis percentages for remaining
 * columns remains the same, which is incorrect. E.g., if there
 * were 4 columns to begin with and each is 25%, after changing
 * one to fixed at 400px wide, the remaining cols shouldn't still
 * be 25% each, but they are. They should be 33% each.
 */

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
    this.initControls();
  },

  onResize: function(){
    this.totalWidth = this.getTotalFluidWidth();
    this.setColumns();
    this.redrawGridLines();
  },

  changeTotalColumns: function( cols ){
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
    this.totalFluidWidth = 0;
    this.totalWidth = this.getTotalFluidWidth();
    this.columnWidth = 1 / this.$columnList.length * 100 + "%";
    this.containmentOffset = 1/12 * this.totalWidth;
  },

  makeHtml: function( ){
    var markup = "",
        m = $("<div/>"),
        cols = this.totalColumns,
        rand,
        dragger = "<div class='dragger'><div class='handle'></div></div>",
        controls = "<form class='cell-settings'><label>Fluid width: <input type='radio' name='width' value='fluid' checked></label><label>Fixed width: <input type='radio' name='width' value='fixed'></label></form>",
        getCopy = loremGenerator.getRandomSegment.bind(loremGenerator);

    // Only add the controls for fixing width on first and last column;
    markup += "<div class='cell first'>" + controls + dragger + "<div class='inner'><p><span class='outer-span'><span class='inner-span'>" + getCopy() + "</span></span></p></div></div>";

    for (var i=1; i<cols-1; i++){
      markup += "<div class='cell'>" + dragger + "<div class='inner'><p><span class='outer-span'><span class='inner-span'>" + getCopy() + "</span></span></p></div></div>";
    }

    markup += "<div class='cell last'>" + controls + "<div class='inner'><p><span class='outer-span'><span class='inner-span'>" + getCopy() + "</span></span></p></div></div>";

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

  /* 
   * Update Fluid Columns
   *
   * Check whether each column should be fixed or fluid
   * and adjust the percentage width of fluid columns accordingly.
   * e.g. if there are only two fluid columns, set their width
   * to 50%; if there are 3, set to 33%.
   */
  updateFluidColumns: function(){
    var len = this.$columnList.length;
    if (this.getFirstColumn().data("fixedWidth")){
      len--;
    };
    if (this.getLastColumn().data("fixedWidth")){
      len--;
    }
    var columnWidth = 1 / len * 100 + "%";
    this.$columnList.each( function( i, el ){
      if( !$(this).data("fixedWidth")) {
        $(this).css("flex-basis", columnWidth);
      }
    });
  },

  getFluidColumns: function(){
    var arr = [];
    this.$columnList.each( function( i, el ){
      if( !$(this).data("fixedWidth")) {
        arr[i] = el;
      }
    });
    return arr;
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

  getFirstColumn: function(){
    return this.$columnList.eq(0);
  },

  getLastColumn: function(){
    return this.$columnList.last();
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

  initControls: function(){
    $(".cell-settings").each( function(i, el){
      $(this).on("change", onChangeWidthType); 
      $(this).on("submit", function(e){
        e.preventDefault();
      });
    });

    function onChangeWidthType(e){
      if ( $(e.target).val() === "fixed" ){ 
        var fixParentCol = setFixedWidth.bind($(this)); // this is the form
        fixParentCol();
      } else {
        var fluidParentCol = setFluidWidth.bind($(this));
        fluidParentCol();
      }
    };

    function onChangeFixedWidth(e){
      e.stopPropagation();
      var w = $(this).val(),
          $currentColumn = $(this).closest(".cell");
      // Check to make sure number is within limits before doing anything:
      if (w < 1500 && w > 50){
        $currentColumn.data( "fixedWidth", w );
        $currentColumn.css( {
          "flex-grow": "0", 
          "flex-shrink": "0",
          "flex-basis": w + "px"
          } 
        );
      } else {
        $(this).val( $currentColumn.data( "fixedWidth" ) );
      }

      columnar.redrawGridLines( $currentColumn );
    };

    function setFluidWidth(){
      var $this = $(this),
          $currentColumn = $this.closest(".cell"),
          $prevColumn = $this.prev();

      $currentColumn
        .css( {
          "flex-grow": "0", 
          "flex-shrink": "1",
          "flex-basis": "25%" 
          } ) 
        .removeData("fixedWidth")
        .find(".fixedWidthInput")
        .remove();

      if ( $prevColumn.length ){
        $prevColumn.find(".dragger").show();  
      }
      $currentColumn.find(".dragger").show();

      columnar.setColumns();
      columnar.redrawGridLines( $currentColumn );
    };

    function setFixedWidth(){
      var $this = $(this),
          $currentColumn = $this.closest(".cell"),
          $prevColumn = $currentColumn.prev(),
          w = $currentColumn.width();
        
      if ( $prevColumn.length ){
        $prevColumn.find(".dragger").hide();  
      }

      $currentColumn.find(".dragger").hide();

      var $input = $("<input type='number' max='480' min='50' class='fixedWidthInput' />");
      $this.prepend( $input );
      
      $input
        .val(w)
        .on("change", onChangeFixedWidth)
        .trigger("change");

      $this.css( {
        "flex-grow": "0", 
        "flex-shrink": "0",
        "flex-basis": w + "px"
        } 
      );

      $this.data( "fixedWidth", w );
      columnar.totalFluidWidth += w;
      columnar.updateFluidColumns();
    }

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
    var percentage = (ui.position.left / columnar.getTotalFluidWidth() ) * 100;
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
  getTotalFluidWidth: function(){
    return this.$colWrapper.width() - this.totalFluidWidth;
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