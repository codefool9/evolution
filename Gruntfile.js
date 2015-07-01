module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        banner: "/*\n" +
            "* <%= pkg.name %> v.<%= pkg.version %>\n" +
            "* Copyright Byron Jones " + new Date().getFullYear() + "\n" +
            "*/",
        jshint: {
            // define the files to lint
            files: ["src/**/*.js"],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you wan to override JSHint defaults
                globals: {
                    loopfunc: false
                },
                ignores: ['src/vendor/**']
            }
        },
        compile: {
            evolution: {
                wrap: 'evolution',
                filename: 'evolution',
                build: 'build',
                scripts: {
                    import: ['main'],
                    src: ['src/**/*.js']
                },
                styles: {
                    options: {
                        paths: "**/*.less",
                        strictImports: true,
                        syncImport: true
                    },
                    files: {
                        'build/evolution.css': [
                            'src/**/*.less'
                        ]
                    }
                },
                templates: [
                    {cwd: 'src', src:'**/*.html'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('hbjs');

    grunt.registerTask('default', [
        'jshint',
        'compile'
    ]);

};