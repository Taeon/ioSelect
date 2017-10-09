module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            js: {
                options: {
                    separator: ';\n'
                },
                src: [
                    'src/js/ioselect.js'
                ],
                dest: 'dist/js/ioselect.js'
            },
        },
        replace: {
          example: {
            src: ['dist/js/ioselect.js'],
            dest: 'dist/js/ioselect.js',
            replacements: [
                {
                  from: 'this.container',
                  to: 'this.c'
                },
                {
                  from: 'this.listeners',
                  to: 'this.l'
                },
                {
                  from: 'this.options',
                  to: 'this.o'
                },
                {
                  from: 'this.element',
                  to: 'this.e'
                },
                {
                  from: 'this.dropdown',
                  to: 'this.d'
                },
                {
                  from: 'unbind:function',
                  to: 'u:function'
              },
                {
                  from: 'bind:function',
                  to: 'b:function'
                },
              {
                from: 'this.bind',
                to: 'this.b'
              },
              {
                from: 'this.unbind',
                to: 'this.u'
              }
            ]
          }
      },
        copy: {
          main: {
            files:[
                {
                    src: 'dist/js/ioselect.js',
                    dest: 'dist/js/ioselect.jquery.js',
                },
                {
                    src: 'src/css/*.css',
                    dest: 'dist/css/',
                    flatten: true,
                    expand: true,
                }
            ],
            options: {
              process: function (content, srcpath) {
                return content.replace(/\/\/ NINJA \/\//g, '');
              }
            }
          }
        },
        insert: {
            options: {},
            ninja: {
               src: "lib/ninja.js",
               dest: "dist/js/ioselect.js",
               match: "// NINJA //"
           }
        },
        watch: {
            js:{
                files: ['<%= concat.js.src %>'],
                tasks: ['concat:js','uglify']
            },
            options: {
                spawn: false,
            }
        },
        uglify: {
            js: {
                files:{
                    'dist/js/ioselect.min.js': 'dist/js/ioselect.js',
                    'dist/js/ioselect.jquery.min.js': 'dist/js/ioselect.jquery.js',
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-insert');
    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask(
        'default',
        [
            'concat:js',
            'replace',
            'copy',
            'insert',
            'uglify'
        ]
    );

};
