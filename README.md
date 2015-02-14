# Canvas sprite

A simple sprite animation that renders to a canvas tag

![alt demo](https://raw.github.com/shadowmint/iwc-sprite/master/media/demo.png)

## Usage

    <div id="foo" class="component--sprite" data-active="foo">

      <!-- Number of frames in the sprite sheet -->
      <meta data-fx="8" data-fy="8" data-fps="30"/>

      <!-- Size of teh canvas and source image to use -->
      <meta data-width="32" data-height="32" data-src="simple.png"/>

      <!-- Individual sets of sprites as named states -->
      <meta data-state="foo" data-offset="0" data-length="8" data-loops="true"/>
      <meta data-state="bar" data-offset="8" data-length="8">
    </div>

    ...

    var $foo = $('#foo');
    var sprite = iwc.components.query($foo);
    console.log(sprite.states());

    sprite.state('foo');
    console.log(sprite.debug());

## Build

A full list of build values is contained in the 'build' npm run script.

    npm run build

To start a local dev server to play with, use:

    npm run server

Then open http://localhost:3008/demo/index.html
