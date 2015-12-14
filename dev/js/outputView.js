/**
 * Output View
 */
var OutputView = (function(){
  'use strict';
  
  return {

    $markup: null,

    $css: null,

    render: function( html, css ){
      
      var $css,
      $output = $( "#output" );

      if ( !this.$markup ){
        $output.append('<div class="output-text"><h2 class="settings-title">Your HTML</h2><pre><code id="markup"></code></pre></div>');
        $output.append('<div class="output-text"><h2 class="settings-title">Your CSS</h2><pre><code id="css"></code></pre></div>');
        this.$markup = $( "#markup" );
        this.$css = $( "#css" );
      }

      this.$markup.html( html );
      this.$css.html( css );
    }
    
  };

})();