module.exports = function (grunt) {

    //import closure compiler
    require('google-closure-compiler').grunt(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dst: 'dist',
        projectName: 'TmDropdown',
        siteroot: 'docs',
        clean: {
            dist: {
                src: ['<%= dst %>/*']
            },
            docs: {
                src: ['<%=siteroot%>/*']
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
                    banner: '/*! TmDropdown v<%=pkg.version%>\n *(C) <%=pkg.author%> <%= grunt.template.today("yyyy") %>\n */\n;(function (window,document) {\n',
                    footer: '\n})(window,document);'
                }
            },
            jsexamples: {
                src: [
                    'src/js/examples-native.js',
                    'src/js/examples-jquery.js'
                ],
                dest: '<%= dst %>/examples/tmd-basics.js'
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
                dest: '<%=dst%>/examples/index.html'
            }
        },
        copy: {
            cssImgs: {
                expand: true,
                cwd: 'src',
                src: 'css/img/*',
                dest: '<%=dst%>'
            },
            css: {
                expand: true,
                cwd: '<%= dst %>',
                src: 'css/**',
                dest: '<%= siteroot %>/',
            },
            js: {
                expand: true,
                cwd: '<%= dst %>',
                src: 'js/<%= projectName %>.js',
                dest: '<%= siteroot %>/'
            },
            examples: {
                files: [
                    {expand: true, cwd: '<%= dst %>/examples', src: 'index.html', dest: '<%= siteroot %>'},
                    {expand: true, cwd: '<%= dst %>/examples', src: 'tmd-basics.js', dest: '<%= siteroot %>/js'}
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
            convertToPrototype: {
                files: {
                    'bin/<%=projectName%>-v<%= pkg.version %>.proto.js': ['dist/js/<%=projectName%>.js']
                },
                options: {
                    compilation_level: 'WHITESPACE_ONLY',
                    language_in: 'ECMASCRIPT6_STRICT',
                    formatting: 'pretty_print',
                    create_source_map: 'bin/<%=projectName%>-v<%= pkg.version %>.proto.js.map',
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
    grunt.registerTask('build', ['concat', 'sass', 'copy']);
    grunt.registerTask('clCompile', ['closure-compiler']);
};
