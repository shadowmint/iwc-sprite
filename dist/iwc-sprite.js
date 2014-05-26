(function(data) {
  var __extends = this.__extends || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p)) d[p] = b[p];

    function __() {
      this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
  };
  define(["require", "exports", 'jquery', 'iwc'], function(require, exports, $, iwc) {
    var Component = (function(_super) {
      __extends(Component, _super);

      function Component() {
          _super.apply(this, arguments);
          /** FPS to render at */
          this._step = 1000.0 / 60.0;
          this._idle = null;
          this._handler = null;
          /** Size of this canvas */
          this._dx = 0;
          this._dy = 0;
        }
        /** Raw template for this component */
      Component.prototype.content = function() {
        return data.markup;
      };
      /** On load */
      Component.prototype.init = function() {
        var _this = this;
        var config = this.data._all[0];
        var canvas = $(this.root).find('canvas');
        if (canvas.length) {
          // Setup state
          this._gc = canvas[0]['getContext']('2d');
          this._frame = new Frame();
          this._anim = new Animation('hi', 0, 10, true);
          this._texture = new Texture(config.src, config.fx, config.fy);
          // Setup canvas from component attributes
          this._dx = parseInt(config.width);
          this._dy = parseInt(config.height);
          canvas.attr('width', this._dx);
          canvas.attr('height', this._dy);
          $(this.root).css('width', this._dx);
          $(this.root).css('height', this._dy);
          // FPS maybe?
          if (config.fps) {
            this._step = 1000 / parseInt(config.fps);
          }
          // parse states & pick one
          this._states = new States(this.data._all);
          this.state(this._states.states()[0]);
          // render!
          this._handler = function(dt) {
            _this._render(dt);
          };
          this._animate();
        } else {
          throw "Browser does not support canvas 2d api";
        }
      };
      /** Set the state */
      Component.prototype.state = function(name) {
        if (this._states.data[name]) {
          var s = this._states.data[name];
          if (!s) {
            throw "Invalid state; must be in " + this.states();
          }
          this._anim = this._states.data[name];
          this._anim.value = 0;
        }
        return null;
      };
      /** Return the list of possible states */
      Component.prototype.states = function() {
        return this._states.states();
      };
      /** Console log debug information about sheet */
      Component.prototype.debug = function() {
        var t = this._texture;
        var a = this._anim;
        console.log('Texture: ' + t.fx + 'x' + t.fy + ' frames @ ' + t.fdx + 'x' + t.fdy + ' pixels');
        console.log('Animation: ' + a.name + ' frames ' + a.offset + ' + ' + a.length + ' frames (loops: ' + a.loops + ')' + ' currently: ' + a.value);
      };
      /** Start animations */
      Component.prototype._animate = function() {
        window['requestAnimationFrame'](this._handler);
      };
      /** Render the next frame */
      Component.prototype._render = function(dt) {
        if (this._idle == null) {
          this._idle = dt;
        }
        if ((dt - this._idle) > this._step) {
          var gc = this._gc;
          var tex = this._texture;
          var frame = this._frame;
          gc.clearRect(0, 0, this._dx, this._dy);
          gc.drawImage(tex.image, frame.x, frame.y, frame.dx, frame.dy, 0, 0, this._dx, this._dy);
          this._idle = null;
          this._anim.next(this._frame, this._texture);
        }
        this._animate();
      };
      return Component;
    })(iwc.Base);
    exports.Component = Component;
    /** A single frame of an animation */
    var Frame = (function() {
      function Frame() {}
      return Frame;
    })();
    /** Info about a texture */
    var Texture = (function() {
      /**
       * Create a new texture object
       * @param src The source image for this texture.
       * @param fx The number of frames wide this texture is.
       * @param fx The number of frames height this texture is.
       */
      function Texture(src, fx, fy) {
          var _this = this;
          this.fx = fx;
          this.fy = fy;
          this.image = new Image();
          this.image.onload = function() {
            _this._imageResolved();
          };
          this.image.src = src;
        }
        /** When the image has finished loading */
      Texture.prototype._imageResolved = function() {
        this.fdx = Math.floor(this.image.width / this.fx);
        this.fdy = Math.floor(this.image.height / this.fy);
      };
      /** Populate the frame with the nth frame data */
      Texture.prototype.frame = function(n, frame) {
        var y = Math.floor(n / this.fx);
        var x = n % this.fx;
        frame.dx = this.fdx;
        frame.dy = this.fdy;
        frame.x = x * this.fdx;
        frame.y = y * this.fdy;
      };
      return Texture;
    })();
    /** An animation state */
    var Animation = (function() {
      function Animation(name, offset, length, loops) {
          this.value = 0;
          this.offset = offset;
          this.length = length;
          this.loops = loops;
          this.name = name;
        }
        /** Move to the next animation state */
      Animation.prototype.next = function(frame, texture) {
        var changed = false;
        if ((this.value + 1) >= this.length) {
          if (this.loops) {
            this.value = 0;
            changed = true;
          }
        } else {
          this.value += 1;
          changed = true;
        }
        if (changed) {
          var v = this.offset + this.value;
          texture.frame(v, frame);
        }
      };
      return Animation;
    })();
    var States = (function() {
      /** Parse the states on this object and record them */
      function States(states) {
          /** Set of animation states */
          this.data = {};
          var count = 0;
          for (var i = 0; i < states.length; ++i) {
            var s = states[i];
            if (s.state && s['length'] && s.offset && s.loops) {
              var loops = s.loops.toLowerCase() == 'true' || s.loops == '1' ? true : false;
              this.data[s.state] = new Animation(s.state, parseInt(s.offset), parseInt(s.length), loops);
              count++;
            }
          }
          if (count == 0) {
            var s = states[0];
            var length = parseInt(s.fx) * parseInt(s.fy);
            var loops = s.loops && (s.loops.toLowerCase() == 'true' || s.loops == '1') ? true : false;
            this.data['_'] = new Animation('_', 0, length, loops);
          }
        }
        /** Return a list of state keys */
      States.prototype.states = function() {
        var rtn = [];
        for (var key in this.data) {
          rtn.push(key);
        }
        return rtn;
      };
      return States;
    })();
    exports.States = States;
    /** Component factory */
    var Factory = (function() {
      function Factory() {
          /** Inline styles */
          this.stylesheet = data.styles;
        }
        /** Find root nodes */
      Factory.prototype.query = function(root) {
        return $(root).find('.component--sprite');
      };
      /** New instance */
      Factory.prototype.factory = function() {
        return new Component();
      };
      return Factory;
    })();
    exports.Factory = Factory;
    // Actually register
    iwc.register(new Factory());
  });
  //# sourceMappingURL=script.js.map
})({
  styles: ".component--sprite {\n  padding: 0px;\n  margin: 0px; }\n  .component--sprite canvas {\n    padding: 0px;\n    margin: 0px; }\n",
  markup: "<canvas></canvas>",
  resources: {}
});