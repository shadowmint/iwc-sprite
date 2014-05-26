/// <reference path="../../bower_components/iwcjs/defs/iwc.d.ts" />
/// <reference path="../../defs/jquery/jquery.d.ts" />
import iwc = require('iwc');
export declare class Component extends iwc.Base {
    /** Raw template for this component */
    content(): any;
    /** Texture we're using */
    private _texture;
    /** Current frame */
    private _frame;
    /** Active animation */
    private _anim;
    /** State list */
    private _states;
    /** GC for this component */
    private _gc;
    /** FPS to render at */
    private _step;
    private _idle;
    private _handler;
    /** Size of this canvas */
    private _dx;
    private _dy;
    /** On load */
    init(): void;
    /** Set the state */
    state(name: string): void;
    /** Return the list of possible states */
    states(): string[];
    /** Console log debug information about sheet */
    debug(): void;
    /** Start animations */
    private _animate();
    /** Render the next frame */
    private _render(dt);
}
export declare class States {
    /** Set of animation states */
    data: any;
    /** Parse the states on this object and record them */
    constructor(states: any[]);
    /** Return a list of state keys */
    states(): string[];
}
/** Component factory */
export declare class Factory {
    /** Inline styles */
    stylesheet: string;
    /** Find root nodes */
    query(root: any): any;
    /** New instance */
    factory(): any;
}
