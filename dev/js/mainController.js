/**
 * Controller for the column grid app
 */
var Controller = (function(){
  'use strict';

  return {

    $columns: $( "#columns"), // the container of columns

    /**
     * Initialize the controller 
     * 1. Setting events 
     * 2. Tell the grid to render.
     * 3. Instantiate jquery-ui dragger
     */
    init: function(){

      var that = this;

      SettingsView.init();

      this.initEvents();

      GridView.init();

      // init draggers only once they've been rendered by GridView.init();
      DragController.initDraggers(); 

      OutputController.init();

    },

    /**
     * Add event listener to the UI using event delegation.
     */
    initEvents: function(){
      var that = this,
          settings = document.getElementById('settings');

      settings.addEventListener( "change", function(e){
        
        var targ = e.target,
            id = targ.getAttribute("id"),
            val = targ.value;
        
        switch ( true ) {

          // Gutter-width settings have been changed
          case (id == "gutter-width"):
            that.setGutterWidth(val);
            break;

          // Number of columns has been changed
          case (id == "numcolumns"):
            that.setNumColumns(val);
            break;

          // Add CSS prefixes setting has changed (id is begins with "prefix")
          case (/^prefix/.test(id)):
            var addPrefixes = val == "yes" ? true : false;
            that.setPrefixSetting(addPrefixes);
        }
      });
    }, 

    getNumColumns: function(){
      return Model.numColumns;
    },

    setNumColumns: function(n){
      Model.numColumns = n;
      SettingsView.updateNumColumns(n);

      // Remove the old draggers from memory. Is this necessary?
      DragController.killDraggers();

      GridView.updateNumColumns(n);
      DragController.initDraggers();
      OutputController.updateNumColumns(n);

    },

    getGutterWidth: function(){
      return Model.gutterWidth;
    },

    setGutterWidth: function(w){
      Model.gutterWidth = w;
      SettingsView.updateGutterWidth(w);
      GridView.updateGutterWidth(w);
      OutputController.updateGutterWidth(w);
    },

    getGridDivisions: function(){
      return Model.gridDivisions;
    },

    getPrefixSetting: function(){
      return Model.addPrefixes;
    },

    setPrefixSetting: function(b){
      Model.addPrefixes = b;
      OutputController.setPrefixing(b);
    },

    getTotalWidth: function(){
      return this.$columns.width();
    }

  };

  
})();