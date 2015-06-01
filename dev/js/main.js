(function setEvents(){

  $( "#settings" ).on( "change", function(e){
    var targ = e.target,
        id = targ.getAttribute("id");
    switch ( id ) {
      case "gutter":
        columnsLayout.changeGutterWidth( targ.value );
        markupGenerator.changePaddingWidth( targ.value );
        break;
      case "numcolumns":
        columnsLayout.changeTotalColumns( targ.value );
        break;
    }
  });

  $( "#generate" ).on( "click", function(e) {
    e.preventDefault();
    var $columnList = columnsLayout.getColumnList();
    markupGenerator.generateMarkup( $columnList );
  });

  $( window ).on( "resize", columnsLayout.onResize );

  var range = document.querySelector('#numcolumns'),
      value = document.querySelector('.range-value');
    
  value.innerHTML = range.getAttribute('value');

  range.addEventListener('input', function( e ){
    value.innerHTML = e.target.value;
  }); 

})();