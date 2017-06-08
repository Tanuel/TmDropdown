module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dst: 'dist',
        jsfilename: 'TmDropdown.js',
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
                dest: '<%= dst %>/js/<%= jsfilename %>',
                options: {
                    banner: '/*! TmDropdown v<%=pkg.version%>\n *(C) <%=pkg.author%> <%= grunt.template.today("yyyy") %>\n */\n;(function (window) {\n',
                    footer: '\n})(window);'
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
            cssImgs:{
               expand:true,
               cwd:'src',
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
                src: 'js/<%= jsfilename %>',
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
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
            },
            dist: {
                files: {
                    'dist/<%= pkg.version %>/<%= pkg.name %>.<%= pkg.version %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    //grunt.registerTask('clean', ['clean']);
    grunt.registerTask('build', ['concat', 'sass', 'copy']);
};
