(function setEvents(){

  var numColsOutput = document.getElementById('num-columns-output'),
      numcolumns = document.getElementById('numcolumns'),
      numEmsOutput = document.getElementById('num-ems-output'),
      gutterWidth = document.getElementById('gutter-width'),
      settings = document.getElementById('settings'),
      generate = document.getElementById('generate');

  numColsOutput.innerHTML = numcolumns.value;
  numEmsOutput.innerHTML = gutterWidth.value + 'px';

  numcolumns.addEventListener("input", function(e){
    numColsOutput.innerHTML = e.target.value;
  });

  gutterWidth.addEventListener("input", function(e){
    numEmsOutput.innerHTML = e.target.value + "px";
  });

  settings.addEventListener( "change", function(e){
    var targ = e.target,
        id = targ.getAttribute("id");
    switch ( id ) {
      case "gutter-width":
        columnsLayout.changeGutterWidth( targ.value );
        markupGenerator.changePaddingWidth( targ.value );
        break;
      case "numcolumns":
        columnsLayout.changeTotalColumns( targ.value );
        break;
    }
  });

  generate.addEventListener( "click", function(e) {
    e.preventDefault();
    var $columnList = columnsLayout.getColumnList();
    markupGenerator.generateMarkup( $columnList );
  });

  window.addEventListener( "resize", columnsLayout.onResize );

})();