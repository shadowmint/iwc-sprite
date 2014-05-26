/// <reference path="../../bower_components/iwcjs/defs/iwc.d.ts"/>
/// <reference path="../../defs/jquery/jquery.d.ts"/>
/// <amd-dependency='jquery'/>
import $ = require('jquery');
import iwc = require('iwc');
declare var data;

export class Component extends iwc.Base {

    /** Raw template for this component */
    public content():any { return data.markup; }

    /** Texture we're using */
    private _texture:Texture;

    /** Current frame */
    private _frame:Frame;

    /** Active animation */
    private _anim:Animation;

    /** State list */
    private _states:States;

    /** GC for this component */
    private _gc:any;

    /** FPS to render at */
    private _step:number = 1000.0 / 60.0;
    private _idle:number = null;
    private _handler:any = null;

    /** Size of this canvas */
    private _dx:number = 0;
    private _dy:number = 0;

    /** On load */
    public init():void {
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
            this._handler = (dt) => { this._render(dt); };
            this._animate()
        }
        else {
            throw "Browser does not support canvas 2d api";
        }
    }

    /** Set the state */
    public state(name:string):void {
      if (this._states.data[name]) {
        var s = this._states.data[name];
        if (!s) {
          throw "Invalid state; must be in " + this.states();
        }
        this._anim = this._states.data[name];
        this._anim.value = 0;
      }
      return null;
    }

    /** Return the list of possible states */
    public states():string[] {
      return this._states.states();
    }

    /** Console log debug information about sheet */
    public debug():void {
        var t = this._texture;
        var a = this._anim;
        console.log('Texture: ' + t.fx + 'x' + t.fy + ' frames @ ' + t.fdx + 'x' + t.fdy + ' pixels');
        console.log('Animation: ' + a.name + ' frames ' + a.offset + ' + ' + a.length + ' frames (loops: ' + a.loops + ')' + ' currently: ' + a.value);
    }

    /** Start animations */
    private _animate() {
        window['requestAnimationFrame'](this._handler);
    }

    /** Render the next frame */
    private _render(dt:number) {
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
    }
}

/** A single frame of an animation */
class Frame {

    /** The x and y offsets */
    public x:number;
    public y:number;

    /** The x and y frame sizes */
    public dx:number;
    public dy:number;
}

/** Info about a texture */
class Texture {

    /** The image associated with this texture */
    public image:any;

    /** The number of frames in each direction */
    public fx:number;
    public fy:number;

    /** The size of each frame */
    public fdx:number;
    public fdy:number;

    /**
     * Create a new texture object
     * @param src The source image for this texture.
     * @param fx The number of frames wide this texture is.
     * @param fx The number of frames height this texture is.
     */
    public constructor(src:string, fx:number, fy:number) {
        this.fx = fx;
        this.fy = fy;
        this.image = new Image();
        this.image.onload = () => { this._imageResolved(); }
        this.image.src = src;
    }

    /** When the image has finished loading */
    private _imageResolved():void {
        this.fdx = Math.floor(this.image.width / this.fx);
        this.fdy = Math.floor(this.image.height / this.fy);
    }

    /** Populate the frame with the nth frame data */
    public frame(n:number, frame:Frame) {
        var y = Math.floor(n / this.fx);
        var x = n % this.fx;
        frame.dx = this.fdx;
        frame.dy = this.fdy;
        frame.x = x * this.fdx;
        frame.y = y * this.fdy;
    }
}

/** An animation state */
class Animation {

  /** The name of this animation */
  public name:string;

  /** Start frame and length */
  public offset:number;
  public length:number;

  /** Does this animation loop? */
  public loops:boolean;

  /** Current value */
  public value:number;

  constructor(name:string, offset:number, length:number, loops:boolean) {
      this.value = 0;
      this.offset = offset;
      this.length = length;
      this.loops = loops;
      this.name = name;
  }

  /** Move to the next animation state */
  public next(frame:Frame, texture:Texture):void {
    var changed = false;
    if ((this.value + 1) >= this.length) {
      if (this.loops) {
        this.value = 0;
        changed = true;
      }
    }
    else {
      this.value += 1;
      changed = true;
    }
    if (changed) {
      var v = this.offset + this.value;
      texture.frame(v, frame);
    }
  }
}

export class States {

  /** Set of animation states */
  public data:any = {};

  /** Parse the states on this object and record them */
  constructor(states:any[]) {
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
  public states():string[] {
    var rtn = [];
    for (var key in this.data) {
      rtn.push(key);
    }
    return rtn;
  }
}

/** Component factory */
export class Factory {

    /** Inline styles */
    public stylesheet:string = data.styles;

    /** Find root nodes */
    public query(root:any):any { return $(root).find('.component--sprite'); }

    /** New instance */
    public factory():any { return new Component(); }
}

// Actually register
iwc.register(new Factory());
