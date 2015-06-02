var markupGenerator = (function(){

  'use strict';

  // private variables
  var gutterEms = 2,
      $markup,
      $css;

  // private methods

  // </div>
  var getEndTag = function( tagname ){
    return "&lt;<span class='tagname'>/" + tagname + "</span>&gt;";
  }

  // <div
  var getStartTagOpen = function( tagname, indents ){
    var indents = indents || 0,
        spaces = "";
    for (var i=0; i<indents; i++){
      spaces += " ";
    }
    return  spaces + "&lt;<span class='tagname'>" + tagname + "</span>";
  }

  // >
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

  /*
   * return a css class wrapped in a span, 
   * e.g. <span class='classname'>.some-class</span>
   */
  var getClassName = function ( classname ){
    return "<span class='classname'>" + "." + classname + "</span>";
  }

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

  var getCss = function( options ){
    var defaults = {
      classname: "some-class",
      props: {}
    };
    var settings = $.extend({}, defaults, options);
    var css = getClassName( settings.classname ) + " {\n";
    for (var prop in settings.props){
      css += "  " + getSpanClass("propname") + prop + "</span>: " + getSpanClass("valuename") + settings.props[prop] + "</span>;\n";
    }
    css += "}\n\n";
    return css;
  };

  // public methods
  return {

    changePaddingWidth: function( n ){
      gutterEms = n/16;
    },

    /** 
      * @desc Create html and css markup for users to copy and paste
      * @param $columnList is a jquery object of columns in the grid. 
      * We use it to determine width and other properties of our grid columns.
    */
    generateMarkup: function( $columnList ){

      var html = "",
          css  = "",
          classesArr = [];

      html += getEl({ 
                indent: 0,
                tag: "div", 
                classes: ["flex-container"],
              });

      css += getCss( {
                        classname: "flex-container",
                        props: { 
                          "box-sizing": "border-box", 
                          "display": "flex",
                          "width": "100%"
                        }
                      } );

      css += getCss( {
                    classname: "flex-column",
                    props: { 
                      "box-sizing": "inherit", 
                      "padding": "0 " + gutterEms/2 + "em;",
                    }
                  } )

      $columnList.each( function( i, el){
        // get the width of each column in grid units
        var gridEnd = $( this ).data("startCol"),
            gridStart = i > 0 ? $( this ).prev().data("startCol") : 0,
            numColumns = Math.abs(gridEnd - gridStart),
            w = (numColumns/12 * 100 ),
            colClass = "cols-" + numColumns;

        if ( classesArr.indexOf(colClass) == -1 ) {
          classesArr.push(colClass);

          css += getCss( {
                        classname: "flex-column." + colClass,
                        props: { 
                          "flex": "0 0 " + w + "%", 
                        },
                      } );
        } 
        
        html += getEl({ 
                  indent: 2, 
                  tag: "div", 
                  classes: ["flex-column", colClass],
                  innerText: "some content"
                });
      });

      html += getEndTag( "div" );

      var $output = $( "#output" );

      if ( !$markup ){
        $output.append('<div class="output-text"><h2 class="settings-title">Your HTML</h2><pre><code id="markup"></code></pre></div>');
        $output.append('<div class="output-text"><h2 class="settings-title">Your CSS</h2><pre><code id="css"></code></pre></div>');
        $markup = $( "#markup" );
        $css = $( "#css" );
      }

      $markup.html( html );
      $css.html( css );

    },

  };

})();
