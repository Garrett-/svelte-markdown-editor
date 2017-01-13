(function ( global, factory ) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.MarkdownView = factory());
}(this, (function () { 'use strict';

var template = (function () {
  return {

    onrender() {
      this.htmlObserver = this.observe('html', html => {
        if(html) {
          this.refs.view.innerHTML = html;
        }
      });

      const html = this.get('html');
      if(html) {
        this.refs.view.innerHTML = html;
      }
    },

    onteardown() {
      this.htmlObserver.cancel();
    },

    data() {
      return {
        html: ''
      };
    }

  }
}());

let addedCss = false;
function addCss () {
	var style = createElement( 'style' );
	style.textContent = "\n  .markdown-output[svelte-521600278], [svelte-521600278] .markdown-output {\n    padding: 1em;\n  }\n\n  .markdown-output  h1[svelte-521600278], .markdown-output  [svelte-521600278] h1, .markdown-output[svelte-521600278]  h1, [svelte-521600278] .markdown-output  h1 { font-size: 200%; }\n  .markdown-output  h2[svelte-521600278], .markdown-output  [svelte-521600278] h2, .markdown-output[svelte-521600278]  h2, [svelte-521600278] .markdown-output  h2 { font-size: 180%; }\n  .markdown-output  h3[svelte-521600278], .markdown-output  [svelte-521600278] h3, .markdown-output[svelte-521600278]  h3, [svelte-521600278] .markdown-output  h3 { font-size: 160%; }\n  .markdown-output  h4[svelte-521600278], .markdown-output  [svelte-521600278] h4, .markdown-output[svelte-521600278]  h4, [svelte-521600278] .markdown-output  h4 { font-size: 140%; }\n  .markdown-output  h5[svelte-521600278], .markdown-output  [svelte-521600278] h5, .markdown-output[svelte-521600278]  h5, [svelte-521600278] .markdown-output  h5 { font-size: 120%; }\n  .markdown-output  h6[svelte-521600278], .markdown-output  [svelte-521600278] h6, .markdown-output[svelte-521600278]  h6, [svelte-521600278] .markdown-output  h6 { font-size: 115%; }\n  .markdown-output  ul[svelte-521600278], .markdown-output  [svelte-521600278] ul, .markdown-output[svelte-521600278]  ul, [svelte-521600278] .markdown-output  ul, ol[svelte-521600278], [svelte-521600278] ol { list-style: initial; }\n";
	appendNode( style, document.head );

	addedCss = true;
}

function renderMainFragment ( root, component ) {
	var div = createElement( 'div' );
	div.setAttribute( 'svelte-521600278', '' );
	div.className = "markdown-output";
	component.refs.view = div;

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},
		
		update: noop,
		
		teardown: function ( detach ) {
			if ( component.refs.view === div ) component.refs.view = null;
			
			if ( detach ) {
				detachNode( div );
			}
		},
	};
}

function MarkdownView ( options ) {
	options = options || {};
	
	this.refs = {}
	this._state = Object.assign( template.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root;
	this._yield = options._yield;

	if ( !addedCss ) addCss();
	
	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	
	if ( options._root ) {
		options._root._renderHooks.push({ fn: template.onrender, context: this });
	} else {
		template.onrender.call( this );
	}
}

MarkdownView.prototype.get = function get( key ) {
 	return key ? this._state[ key ] : this._state;
 };

MarkdownView.prototype.fire = function fire( eventName, data ) {
 	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
 	if ( !handlers ) return;
 
 	for ( var i = 0; i < handlers.length; i += 1 ) {
 		handlers[i].call( this, data );
 	}
 };

MarkdownView.prototype.observe = function observe( key, callback, options ) {
 	var group = ( options && options.defer ) ? this._observers.pre : this._observers.post;
 
 	( group[ key ] || ( group[ key ] = [] ) ).push( callback );
 
 	if ( !options || options.init !== false ) {
 		callback.__calling = true;
 		callback.call( this, this._state[ key ] );
 		callback.__calling = false;
 	}
 
 	return {
 		cancel: function () {
 			var index = group[ key ].indexOf( callback );
 			if ( ~index ) group[ key ].splice( index, 1 );
 		}
 	};
 };

MarkdownView.prototype.on = function on( eventName, handler ) {
 	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
 	handlers.push( handler );
 
 	return {
 		cancel: function () {
 			var index = handlers.indexOf( handler );
 			if ( ~index ) handlers.splice( index, 1 );
 		}
 	};
 };

MarkdownView.prototype.set = function set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

MarkdownView.prototype.teardown = function teardown ( detach ) {
	this.fire( 'teardown' );
template.onteardown.call( this );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
};

function dispatchObservers( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

		var callbacks = group[ key ];
		if ( !callbacks ) continue;

		for ( var i = 0; i < callbacks.length; i += 1 ) {
			var callback = callbacks[i];
			if ( callback.__calling ) continue;

			callback.__calling = true;
			callback.call( component, newValue, oldValue );
			callback.__calling = false;
		}
	}
}

function createElement( name ) {
	return document.createElement( name );
}

function detachNode( node ) {
	node.parentNode.removeChild( node );
}

function insertNode( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function noop() {}

function appendNode( node, target ) {
	target.appendChild( node );
}

return MarkdownView;

})));