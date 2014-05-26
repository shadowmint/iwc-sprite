'use strict';
var ext = require('./.gruntExt');
var iwc = require('./.gruntIwc').load(ext);
module.exports = function (grunt) {

    // Common
    ext.configure({
        clean: {
            component: ['dist/*']
        },
        connect: {
            demo: {
                options: {
                    port: 3008,
                    base: '.'
                }
            }
        }
    });

    // Add build tasks for components
    iwc.component('iwc-sprite', 'src/sprite', 'dist');
    iwc.components();

    // Build the task libraries
    ext.registerTask('default', ['clean', 'components']);
    ext.registerTask('server', ['default', 'connect', 'watch']);

    // Load config
    ext.initConfig(grunt);
};
