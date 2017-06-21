module.exports = function (grunt) {

    //import closure compiler
    require('google-closure-compiler').grunt(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsBanner:'TmDropdown v<%=pkg.version%>\n *(C) <%=pkg.author%> <%= grunt.template.today("yyyy") %>\n *<%=pkg.homepage%>',
        dst: 'dist',
        bin: 'bin',
        projectName: 'TmDropdown',
        siteroot: 'docs',
        clean: {
            dist: {
                src: ['<%= dst %>/*']
            },
            docs: {
                src: ['<%=siteroot%>/*']
            },
            bin: {
                src:['<%=bin%>/*']
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: '\n'
            },
            jsmain: {
                src: [
                    'src/js/tmd-config.js', //default TmDropdown configuration
                    'src/js/tmd-class.js', //class file
                    'src/js/tmd-jquery-plugin.js' //jquery integration plugin
                ],
                dest: '<%= dst %>/js/<%= projectName %>.js',
                options: {
                    banner: '/*! <%=jsBanner%> */\n;(function (window,document) {\n\t"use strict;"\n',
                    footer: '\n})(window,document);'
                }
            },
            jsexamples: {
                src: [
                    'src/js/examples-native.js',
                    'src/js/examples-jquery.js'
                ],
                dest: '<%=siteroot%>/js/tmd-examples.js'
            },
            html: {
                src: [
                    'src/html/header.html',
                    'src/html/examples-native.html',
                    'src/html/examples-jquery.html',
                    'src/html/examples-options.html',
                    'src/html/examples-methods.html',
                    'src/html/footer.html'
                ],
                dest: '<%=siteroot%>/index.html'
            }
        },
        copy: {
            dist:{
                files:[
                    {expand: true,cwd: 'src',src: 'css/img/*',dest: '<%=dst%>'}
                ]
            },
            docs: {
              files: [
                  {expand: true,cwd: '<%= dst %>',src: 'css/**',dest: '<%=siteroot%>/'},
                  {expand: true,cwd: '<%= dst %>',src: 'js/<%= projectName %>.js',dest: '<%=siteroot%>/'}
              ]  
            },
            bin: {
                files:[
                  {expand: true,cwd: '<%= dst %>',src: 'css/**',dest: '<%=bin%>/'},
                  {expand: true,cwd: '<%= dst %>/js',src: '<%= projectName %>.js',dest: '<%=bin%>/',
                      rename:function(dest,src){
                          return dest+'<%=projectName%>-v<%=pkg.version%>.js'
                      }
                  },
                  {expand: true,src: 'README.md',dest: '<%=bin%>/'},
                  {expand: true,src: 'LICENSE',dest: '<%=bin%>/'},
                  {expand: true,src: 'documentation.url',dest: '<%=bin%>/'},
                ]
            }
        },
        sass: {
            main: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= dst %>/css/TmDropdown.css': 'src/scss/TmDropdown.scss'
                }
            }
        },
        'closure-compiler': {
            binProto: {
                files: {
                    'bin/<%=projectName%>-v<%= pkg.version %>.proto.js': ['dist/js/<%=projectName%>.js']
                },
                options: {
                    compilation_level: 'WHITESPACE_ONLY',
                    language_in: 'ECMASCRIPT6_STRICT',
                    formatting: 'pretty_print',
                    //create_source_map: 'bin/<%=projectName%>-v<%= pkg.version %>.proto.js.map',
                    output_wrapper: '%output%\n//# sourceMappingURL=<%=projectName%>-v<%= pkg.version %>.proto.js.map'
                }
            },
            binMinify: {
                files: {
                    'bin/<%=projectName%>-v<%= pkg.version %>.miniproto.js': ['dist/js/<%=projectName%>.js']
                },
                options: {
                    compilation_level: 'SIMPLE_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT6_STRICT',
                    output_wrapper: '%output%\n//# sourceMappingURL=<%=projectName%>-v<%= pkg.version %>.proto.js.map'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');

    //grunt.registerTask('clean', ['clean']);
    grunt.registerTask('build', ['concat', 'sass', 'copy:dist','copy:docs']);
    grunt.registerTask('buildBinaries', ['clean:bin','copy:bin','closure-compiler:binProto','closure-compiler:binMinify']);
};
