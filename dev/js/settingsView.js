 /**
   * Settings View 
   * The portion of UI where users modify  grid and the output to HTML and CSS.
   */
  var SettingsView = (function(){
    'use strict';
    
    return {

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

  })();