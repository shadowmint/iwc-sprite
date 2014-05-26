require.config({
    paths: {
        iwc: '/bower_components/iwcjs/dist/iwc',
        jquery: '/bower_components/jquery/dist/jquery'
    }
});

require(['iwc', '../dist/iwc-sprite', 'jquery'], function (iwc) {
    iwc.load(document.body);
    window.iwc = iwc; // export
});
