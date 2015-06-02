(function setEvents(){

  var numColsOutput = document.getElementById('num-columns-output'),
      numcolumns = document.getElementById('numcolumns'),
      gutterWidth = document.getElementById('gutter-width'),
      gutterWidthOutput = document.getElementById('num-ems-output'),
      settings = document.getElementById('settings');

  numColsOutput.innerHTML = numcolumns.value;
  gutterWidthOutput.innerHTML = gutterWidth.value + 'px';

  numcolumns.addEventListener("input", function(e){
    numColsOutput.innerHTML = e.target.value;
  });

  gutterWidth.addEventListener("input", function(e){
    gutterWidthOutput.innerHTML = e.target.value + "px";
  });

  settings.addEventListener( "change", function(e){
    var targ = e.target,
        id = targ.getAttribute("id"),
        val = targ.value;
    switch ( id ) {
      case "gutter-width":
        columnsLayout.changeGutterWidth( val );
        markupGenerator.changePaddingWidth( val );
        generateMarkup();
        break;
      case "numcolumns":
        columnsLayout.changeTotalColumns( val );
        generateMarkup();
        break;
    }
  });

  function generateMarkup(){
    markupGenerator.generateMarkup( columnsLayout.getColumnList() )
  }

  window.addEventListener( "resize", columnsLayout.onResize );

  generateMarkup();

})();