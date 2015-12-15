/*
 * https://medium.com/@verpixelt/get-started-with-grunt-76d29dc25b01
 */
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['Gruntfile.js','dev/js/*.js'], // array of files to lint
    },

    concat: {   
      dist: {
        src: [
            'dev/js/libs/jquery.js', 
            'dev/js/libs/jquery-ui.js', 
            'dev/js/libs/touch-punch.js', 
            'dev/js/gridModel.js',
            'dev/js/mainController.js',
            'dev/js/dragController.js',
            'dev/js/outputController.js',
            'dev/js/outputView.js',
            'dev/js/gridView.js',
            'dev/js/settingsView.js',
            'dev/js/main.js'
        ],
        dest: 'dev/js/unminified.js',
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          livereload: true
        }
      }
    },

    responsive_images: {
      resize: {
        options: {
          engine: 'gm', // default -- alt is 'im'
          quality: 60,
          sizes: [{
            suffix: '_small_1x', // this will result in filename-320_small_1x.jpg
            width: 320
          },{
            suffix: '_medium_1x', // this will result in filename-320_small_1x.jpg
            width: 640
          },{
            suffix: '_large_1x', // this will result in filename-320_small_1x.jpg
            width: 1023
          },{
            name: 'original', rename: false, width: '100%'
          }]
        },
        files: [{
          expand: true,
          src: ['images/**.{jpg,gif,png}'],
          cwd: 'dev/', // start images should be in dev/images
          dest: 'prod/' // end images should be in prod/images
        }]
      }
    },

    uglify: {
      build: {
        src: 'dev/js/unminified.js',
        dest: 'prod/js/app.min.js'
      }
    },

    processhtml: {
      dev: {
        files: {
          'prod/index.html': ['index.html'] // 'destination.html': ['source.html']
        }
      },
    },

    sass: {                              // Task
      dist: {                            // Target
        options: {                       // Target options
          style: 'compressed' // nested, compact, compressed, expanded
        },
        files: {                         // Dictionary of files
          'dev/css/style.css': 'dev/scss/style.scss',   
          'prod/css/style.min.css': 'dev/scss/style.scss',   
           // 'destination': 'source'
        }
      }
    },

    postcss: {
      options: {
        map: true // inline sourcemaps
      },
      dist: {
        src: '*.css'
      }
    },

    inline: {
      dist: {
        options:{
          cssmin: true,
          uglify: true
        },
        src: 'index.html',
        dest: 'prod/index.html'
      }
    },
    watch: {
      scripts: {
        files: [
                'dev/js/libs/*.js',
                'dev/js/*.js',
                ],
        tasks: ['concat'],
        options: {
            spawn: false,
            livereload: true
        },
      },
      css: {
        files: ['dev/scss/**/*.scss',
                'dev/scss/*.scss',
                ],
        tasks: [ 'sass' ],
        options: {
          spawn: false,
          livereload: true
        }
      },
      html: {
        files: ['index.html'],
        options: {
            livereload: true
        }
      }
    },
    watchForProduction: {
      scripts: {
        files: [ 
                'dev/js/libs/*.js',
                'dev/js/plugins/*.js',
                'dev/js/*.js',
                ],
        tasks: ['concatForProduction'],
        options: {
            spawn: false,
            livereload: true
        },
      },

      css: {
        files: ['dev/scss/**/*.scss',
                'dev/scss/*.scss',
                ],
        tasks: [ 'sass' ],
        options: {
          spawn: false,
          livereload: true
        }
      },

      html: {
        files: ['index.html'],
        options: {
            livereload: false
        }
      },

      jsdoc: {
        dist : {
            src: ['dev/js/unminified.js', 'README.md'],
            options: {
                destination: 'out'
            }
        }
      }

    }
  });
  
  // Load Grunt plugins
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsdoc');

 // Default task(s).
  grunt.registerTask('default', [
    'connect',
    'sass',
    'watch'
    ]);

  grunt.registerTask('lint', [
    'jshint'
    ]);

  grunt.registerTask('doc', [
    'jsdoc'
    ]);

  grunt.registerTask('build', [
    'concat',
    'uglify',
    'sass',
    'processhtml'
    ]);

  grunt.registerTask('resize', [
    'responsive_images',
    ]);
};