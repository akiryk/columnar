  /**
   * Output Controller
   * Display HTML and CSS markup to achieve the grid that a 
   * user creates by dragging the columns.
   */
  var OutputController = (function(){
    'use strict';
    
    // Private vars
    var gutterEms = 2;

    var $columns = $( "#columns");

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
    };

    /*
     * return a <span> fragment with a class, 
     * e.g. <span class='someclass'>
     */
    var getSpanClass = function( classname){
      return "<span class=" + classname + ">";
    };

    var getAttr = function( attr ){
      return getSpanClass("attrname") + attr + "</span>";
    };

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
    };

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
                    } );

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
                          };
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