// x TODO: display dropdown fullscreen on mobile
// x TODO: events
// x TODO: OPTGROUP support
// x TODO: respond to select focus (tabindex)

// Possible features...
// x TODO: No results text
// x TODO: limit number of selections in select multiple
// x TODO: focus on label click
// x TODO: deselect on single select (i.e. set to first blank option)?


/**
 * ioSelect
 *
 * A customisble replacement for the HTML select element
 *
 * See https://github.com/Taeon/ioSelect for docs
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Patrick Fox
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.ioselect = factory();
    }
}(
    this,
    function () {
// Below is a marker for inserting NINJA. Do not remove.
if( typeof $ == 'undefined' ){
    var $ = function( selector ){

        /**
         * append
         */
        var A = function( selector ){
            var nodelist = F( selector );
            for( var i = 0; i < nodelist.length; i++ ) {
                this[0].appendChild( nodelist[ i ] );
            }
            return this;
        };
		/**
        * prepend
        */
        var P = function( selector ){
            var nodelist = F( selector );
            for( var i = nodelist.length - 1; i >= 0 ; i-- ) {
                this[ 0 ].insertBefore( nodelist[ i ], this[ 0 ].firstChild);
            }
            return this;
        };
		/**
        * remove
        */
        var R = function( selector ) {
            this.each( function(){this.parentNode.removeChild(this);} );
        }

    	// each
        var E = function( fn ) {
            for (var i = 0; i < this.length; i++){
                fn.apply(this[i]);
            }
        }


        /**
        * closest
        */
        var FC = function( selector ){
            var elements = [];
            for( var i = 0; i < this.length; i++ ){
                var element = this[ i ];
                while( element ){
                    if ( IS( element, selector ) ) {
                        elements.push( element );
                        element = false;
                    }
                    element = element.parentNode;
                }
            }
            return $( elements );
        };

        /**
        * on
        */
        var O = function( event, func ){
           for( var i = 0; i < this.length; i++ ){
               this[ i ].addEventListener( event, func );
           }
           return this;
        };
        /**
        * off
        */
        var OF = function( event, func ){
           for( var i = 0; i < this.length; i++ ){
               this[ i ].removeEventListener( event, func );
           }
           return this;
        };

        /**
        * addClass
        */
        var AC = function( className ){
            for( var i = 0; i < this.length; i++ ){
                if (this[ i ].classList){
                    this[ i ].classList.add(className);
                } else {
                    this[ i ].className += ' ' + className;
                }
            }
        };
        /**
        * removeClass
        */
        var RC = function( classes ){
            if ( classes.indexOf( ' ' ) != -1 ) {
                classes = classes.split(' ');
            } else {
                classes = [classes];
            }
            for ( var i = 0; i < classes.length; i++ ) {
                var className = classes[i];
                this.each(function(){
                    if (this.classList)
                        this.classList.remove(className);
                    else
                        this.className = this.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
                    }
                );
            }
        };

        /**
        * hasClass
        */
        var HC = function( className ){
            var o = false;
            for( var i = 0; i < this.length; i++ ){
                if (this[ i ].classList){
                    if( this[ i ].classList.contains(className) ){
                        return true
                    };
                } else {
                    if( new RegExp('(^| )' + className + '( |$)', 'gi').test( this[ i ].className ) ){
                        return true
                    };
                }
            }
            return false;
        }

        /**
         * insertBefore
         */
        var IB = function( selector ){
            var nodelist = $( selector );
            for( var i = 0; i < nodelist.length; i++ ){
                var element = nodelist[ i ];
                $( this ).each(
                    function() {
                        element.parentNode.insertBefore(this,element);
                    }
                );
            }
            return this;
        }
        /**
         * insertAfter
         */
        var IA = function( selector ){

            var nodelist = $( selector );
            for( var i = 0; i < nodelist.length; i++ ){
                var element = nodelist[ i ];
                $( this ).each(
                    function() {
                        element.parentNode.insertBefore(this, element.nextSibling);
                    }
                );
            }
            return this;
        }

        /**
        * is
        */
        var IS = function(el, selector) {
            if ( $.isArray( el ) ) {
                for( var i = 0; i < el.length; i++ ){
                    return IS( el[ i ], selector );
                }
            }
            if ( selector instanceof HTMLElement ) {
                return el === selector;
            } else {
                if ( $.isArray( selector ) ) {
                    for( var i = 0; i < selector.length; i++ ){
                        if ( IS( el, selector ) ) {
                            return true;
                        }
                    }
                } else {
                    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
                }
            }
            return this;
        }

        /**
         * trigger
         */
         var T = function( event_name ){
            if ("createEvent" in document) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent( event_name, false, true);
                for( var i = 0; i < this.length; i++ ){
                    this[i].dispatchEvent(evt);
                }
            } else {
                for( var i = 0; i < this.length; i++ ){
                    this[ i ].fireEvent(event_name);
                }
            }
        }

        /**
         * offset (position relative to document)
         */
        OS = function(){
            // Returns the first element
            if( this.length == 0 ){
                return undefined;
            }
            var elem = this[0];
            var box = elem.getBoundingClientRect();

            var body = document.body;
            var docEl = document.documentElement;

            var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

            var clientTop = docEl.clientTop || body.clientTop || 0;
            var clientLeft = docEl.clientLeft || body.clientLeft || 0;

            var top  = box.top +  scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            return { top: Math.round(top), left: Math.round(left) };
        }

        /**
         * find
         */
        var F = function( element, parent_element ){
            var e;
            if( element instanceof HTMLElement || element instanceof Window ){
                e = [element];
            } else {
                switch ( Object.prototype.toString.call(element).match( /\[object (.*)\]/ )[1] ) {
                    case 'String':{
                        if ( element.charAt( 0 ) == '<' ) {
                            var dummy = document.createElement( 'DIV' );
                            dummy.innerHTML = element;
                            elements = dummy.childNodes;
                        } else {
                            var children_only = false;
                            if ( element.charAt( 0 ) == '>' ) {
                                children_only = true;
                                element = element.substring( 1 );
                            }
                            if ( parent_element ) {
                                if ( $.isArray( parent_element ) ) {
                                    var elements = [];
                                    for ( var i = 0; i < parent_element.length; i++ ) {
                                        var found_elements = parent_element[ i ].querySelectorAll(element);
                                        for ( var f = 0; f < found_elements.length; f++ ) {
                                            if(elements.indexOf(found_elements[f]) == -1 ){
                                                elements.push.apply( elements, parent_element[ i ].querySelectorAll(element) );
                                            }
                                        }
                                    }
                                }
                            } else {
                                elements = document.querySelectorAll(element);
                            }
                            if ( children_only ) {
                                var new_elements = [];
                                parent_element = (parent_element)?parent_element:document;
                                for( var i = 0; i < elements.length; i++ ){
                                    if ( IS( parent_element, elements[i].parentNode ) ) {
                                        new_elements.push(elements[i]);
                                    }
                                }
                                elements = new_elements;
                            }
                        }

                        break;
                    }
                    case 'Object':
                    {
                        // jQuery list of elements?
                        if ( typeof jQuery != 'undefined' && element instanceof jQuery ) {
                            elements = element.toArray();
                        }
                        break;
                    }
                    case 'Array':
                    case 'NodeList':{
                        elements = element;
                        break;
                    }
                    case 'Function':{
                        // Call when page loads
                        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
                            element();
                        } else {
                            document.addEventListener('DOMContentLoaded', element);
                        }
                        return;
                    }
                    case 'Undefined':{
                        elements = [];
                        break;
                    }
                    default:{
                        console.log(element);
                        console.log(Object.prototype.toString.call(element).match( /\[object (.*)\]/ )[1]);
                    }
                }
                // Convert elements into array
                var e = [];
                for ( var i = 0; i < elements.length; i++ ) {
                    e.push( elements[ i ] );
                }
            }

            // Add methods
            var f = {append:A,prepend:P,insertAfter:IA,insertBefore:IB,on:O,off:OF,addClass:AC,hasClass:HC,removeClass:RC,each:E,closest:FC,remove:R,trigger:T,offset:OS};
            for ( var fi in f ) {
                e[fi] = function( e, f ){
                   return function(){return f.apply( e, arguments )};
                }.apply( e, [e, f[fi]] )
            }
            e.find = function(selector){return F.apply(e,[selector,e])};

            return e;
        };

        var e = F( selector );

        return e;
    }
    $.proxy = function( func, context ){
        return function(){func.apply( context, arguments )};
    }
    $.isArray = function( arr ){
        return Object.prototype.toString.call( arr ).match( /\[object (.*)\]/ )[1] == 'Array';
    }
}

		var ioselect = function( element, options ){
            this.l = [];

			$( element ).addClass( 'ioselect-hidden' );
			this.e = $( element );
            this.is_multiple = typeof this.e[ 0 ].getAttribute( 'multiple' ) != 'undefined' && this.e[ 0 ].getAttribute( 'multiple' ) != null;

            this.o = {
                search_min: 0, // Lower limit for showing seach box. Zero means 'always'
                search: true, // Set to false to never show search box
                search_in_text: false, // Default (false) will only return results that -start- with search text
                                    // Set to true to return results that -contain- search text.
                mobile_breakpoint: 768 // The width below which the dropdown will be shown fixed-position
            };

            // Overwrite options passed in on constructor
            if( typeof options !== 'undefined' ){
                for( var index in options ){
                    this.o[ index ] = options[ index ];
                }
            }

            // Grab any options from the element
            // https://stackoverflow.com/questions/36971998/can-i-get-all-attributes-that-begin-with-on-using-jquery
            [].slice.call(this.e[0].attributes).filter(function(attr) {
            	return attr && attr.name && attr.name.indexOf('data-ioselect-') === 0
            }).forEach(function(attr) {
            	this.o[attr.name.substr(14).replace( /\-/, '_' )] = attr.value;
            }.bind(this));
            this.o.search_min = parseInt( this.o.search_min );
            this.o.search = this.o.search && this.o.search !== '0';

			this.e[ 0 ].removeAttribute( 'tabindex' );
			var container = $( '<div class="ioselect-container"><div class="ioselect-select ioselect-ns' + ((this.multiple)?' ioselect-multiple':'') + '"></div><div class="ioselect-dropdown"><div class="ioselect-search"><input tabindex="-1" type="text" class="ioselect-input" autocorrect="off" autocapitalize="off"></div><div class="ioselect-buttons"><button class="ioselect-button-close">Close</button></div><ul></ul></div>' );
			$( container ).insertBefore( element );
            this.b(
                container.find( '.ioselect-button-close' )[ 0 ],
                'click',
                this.HideDropdown.bind( this )
            );
			// The outer container for the replacement selector
			var parent = $( this.e[ 0 ].parentNode );
			this.c = $( container )[0];

			// The dropdown -- we'll build it later
			this.d = $( this.c ).find( '.ioselect-dropdown' )[0];

			// Add instance-specific class?
			var dropdown_class = this.e[ 0 ].getAttribute( 'data-ioselect-dropdown-class' );
			if( dropdown_class != null ){
				$( this.d ).addClass( dropdown_class );
			}
			
			this.list = $( this.d ).find( 'ul' )[0];
			this.search = $( this.d ).find( 'input[type=text]' )[ 0 ];
			this.d_built = this.current_selected = false;

			// The replacement select element
			this.select = $( this.c ).find( '.ioselect-select' )[0];

			// We append this to the body because otherwise there are issues with
			// clipping when the select is inside an element with overflow set
			$( document.body ).append( this.d );


			// The mask detects clicks outside the dropdown
			this.mask = $( '<div class="ioselect-mask"></div>' )[0];

			// Search filter text
			this.filter = '';

            // Watches for changes to the original select (e.g. options, disabled)
            this.mutation_listener = this.SelectMutated.bind( this );
            this.mutation_observer = false;
            if( typeof MutationObserver != 'undefined' ){
                // Listen for changes (e.g. add/remove options) and trigger an update
                this.mutation_observer = new MutationObserver(
                    this.mutation_listener
                );
                this.mutation_observer.observe(
                    this.e[ 0 ],
                    {
                        childList: true,
                        attributes: true
                    }
                );
            }

            // Update when the form is reset
			this.b(
                this.e.closest( 'form' ),
                'reset',
                this.Reset.bind(this)
			);

            // Listen for click
            this.b(
                $( this.d ),
                'click',
                this.ClickOption.bind( this )
			);
            // Listen for click
            this.b(
                $( this.select ),
                'click',
                this.ClickSelect.bind(this)
			);

            this.b(
                this.e,
                'change',
				this.Update.bind( this )
			);

			// Stores a delay when updating dropdown due to search filter change
			this.search_timeout = null;

            // Update the text showing in the select area
            this.UpdateSelect();
			//this.scroll_listener = function(event){this.HideDropdown();}.bind(this);
            $( this.e ).trigger( 'ready' );

		}
		ioselect.prototype = {
            on:function( event, func ){
                // We wrap the callback in a function, so that we can pass arguments direct to function
                var _func = function( event ){
                    if( typeof event.detail != 'undefined' && $.isArray( event.detail.__args ) ){
                        var args = [event];
                        args.push.apply(args, event.detail.__args);
                        func.apply(null,args);
                    } else {
                        func.apply( func, arguments );
                    }
                }
                this.b( this.e, event, _func );
            },
            off:function( event, func ){
                this.u( this.e, event, func );
            },
            /**
             * Add an event listener and store a record of it for removal later
             *
             * @param       HTMLElement     element
             * @param       string          event
             @ @param       function        func
             */
            b:function( element, event, func ){
                this.l.push( {element:$(element)[0],event:event,func:func} );
                $( element ).on( event, func );
            },
            /**
             * Remove an event listener
             *
             * @param       HTMLElement     element     [Optional] Element to unbind event from. If undefined, all elements will be unbound
             * @param       string          event       [Optional] The event to remove - if missing, all event listeners will be removed
             @ @param       function        func        [Optional] The listener to be removed -- if missing, all listeners for this event will be removed
             */
            u:function( element, event, func ){
                element = $(element)[0];
                var listeners = [];
                // Loop through all listeners, looking for a match
                for( var i = 0; i < this.l.length; i++ ){
                    var listener = this.l[ i ];
                    if(
                        ( typeof element == 'undefined' || listener.element == element )
                        &&
                        ( typeof event == 'undefined' || event == listener.event )
                        &&
                        ( typeof func == 'undefined' || func == listener.func )
                    ){
                        // Remove this listener
                        $( listener.element ).off( listener.event, listener.func );
                    } else {
                        // Store this for later
                        listeners.push( listener );
                    }
                }
                // Any that weren't removed
                this.l = listeners;
            },
            /**
             * Mutation observer listener
             */
            SelectMutated: function( mutations ){
				for( var i = 0; i < mutations.length; i++ ){
					switch( mutations[i].type ){
						case 'childList':{
                            this.HideDropdown();
							this.Update();
							break;
						}
						case 'attributes':{
							this.UpdateSelect();
							break;
						}
					}
				}
			},
            /**
             * Called when window is resized
             */
			Resize: function(){
				// To avoid rounding errors...
				this.c.style.width = 'auto';
                if( document.documentElement.clientWidth >= this.o.mobile_breakpoint ){
                    // Uses getBoundingClientRect().width because this includes decimal places, avoids visual disjoint from rounding
    				this.d.style.width = this.c.getBoundingClientRect().width + 'px';
                    this.is_mobile = false;
                    $( [this.d,this.c,this.mask] ).removeClass( 'ioselect-mobile' );
                } else {
                    this.d.style.width = '';
                    this.is_mobile = true;
                    $( [this.d,this.c,this.mask] ).addClass( 'ioselect-mobile' );
                }
				this.SetDropdownPosition();
			},
            Reset: function() {
				setTimeout(
					function() {
						this.Update();
					}.bind( this ),
					0
				);
			},

			/**
			 * An option in the dropdown has been clicked
			 */
			ClickSelect: function( event ){
				if( $( this.c ).hasClass( 'ioselect-disabled' ) ){
					return;
				}
				if( $( this.c ).hasClass( 'ioselect-open' ) ){
					this.HideDropdown();
				} else {
					this.ShowDropdown();
				}
			},
			/**
			 * Show the dropdown
			 */
			ShowDropdown: function( event ){
				// We delay creating the dropdown until it's  first opened
				// But it only happens once (unless the search filter text is changed)
				if( !this.d_built ){
					this.BuildDropdown();
				}

				this.current_selected = false;
				this.b( window, 'resize', this.Resize.bind(this) );
				viewportmeta = $('meta[name="viewport"]')[0];
				this.current_meta = viewportmeta.content.split(',');
				var new_meta = [];
				for( var i = 0; i < this.current_meta.length; i++ ){
					var parts = this.current_meta[ i ].split( '=' );
					if( parts[ 0 ] != '' ){
						new_meta.push( this.current_meta[ i ] );
					}
				}
				new_meta.push( 'user-scalable=NO' );
				viewportmeta.content = new_meta.join(',');

				// Enable the mask (in case user clicks outside dropdown)
				$( document.body ).append( this.mask );
                this.b(
                    this.mask,
    				'click',
                    this.HideDropdown.bind( this )
    			);

				// Listen for keypresses (escape, tab)
				this.b(
                    document.body,
					'keydown',
					this.ListenForKeyPress.bind(this)
				);

                if(
                    (
                        this.o.search_min > 0
                        &&
                        this.e.find( 'option' ).length < this.o.search_min
                    )
                    ||
                    !this.o.search
                ){
                    // Hide search box
    				$( this.search ).closest( '.ioselect-search' ).addClass( 'ioselect-hidden' );
                } else {
                    // Listen for search input
    				this.b(
                        this.search,
    					'input',
    					this.Search.bind(this)
    				);
                    $( this.search ).closest( '.ioselect-search' ).removeClass( 'ioselect-hidden' );
                }
                if( !this.is_mobile ){
                    this.scroll_listener_interval = setInterval(
    					this.Scroll.bind(this),
    					10
    				)
                }

				// Hide the dropdown on scroll
				// var parent = this.e.parentNode;
				// while( parent != null ){
				// 	parent.addEventListener( 'scroll', this.scroll_listener );
				// 	parent = parent.parentNode;
				// }

				this.list.scrollTop = 0;

				this.Resize();
                if( !this.is_mobile && !$( this.search ).closest( '.ioselect-search' ).hasClass( 'ioselect-hidden' ) ){
                    this.search.focus();
                }
                $( this.e ).trigger( 'show-dropdown' );
			},
			SetDropdownPosition: function(){
                if( !this.is_mobile ){
                    var position = $( this.c ).offset();

    				this.current_top = position.top;

                    this.d.style.top = ( this.current_top + this.select.offsetHeight ).toString() + 'px';
    				this.d.style.left = position.left.toString() + 'px';

                    // See if it's dropping off the bottom of the screen
    				var dropdown_top = this.current_top - document.documentElement.scrollTop;
                    $( this.d ).addClass( 'ioselect-open' );
    				var dropdown_height = this.d.offsetHeight;
                    $( this.d ).removeClass( 'ioselect-open' );
    				var viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);;
    				if ( dropdown_top + dropdown_height > viewport_height ) {
    					// Put it above the select
    					this.d.style.top = position.top + 'px';
    					$( this.c ).addClass( 'ioselect-select-up' );
    					$( this.d ).addClass( 'ioselect-drop-up' );
    				}
                } else {
                    this.d.style.top = '';
    				this.d.style.left = '';
                }
				$( this.c ).addClass( 'ioselect-open' );
				$( this.d ).addClass( 'ioselect-open' );
			},
			/**
			 * Hide the dropdown
			 */
			HideDropdown: function( event ){
				clearInterval( this.scroll_listener_interval );
				this.u( window, 'resize' );
				this.c.style.width = 'auto';
				if( this.current_selected !== false ){
					$( 'li:nth-child(' + (this.current_selected + 1).toString() + ')' ).removeClass( 'ioselect-current' );
					this.current_selected = false;
				}

				// Reset viewport meta
				if( this.current_meta ){
					$('meta[name="viewport"]')[ 0 ].content = this.current_meta.join(',');
				}
				if( !$( this.c ).hasClass( 'ioselect-open' ) ){
					return;
				}
				// Remove classes
				$( this.c ).removeClass( 'ioselect-open ioselect-select-up' );
                $( this.d ).removeClass( 'ioselect-open ioselect-drop-up' );
				// Hide the mask
				if( this.mask.parentNode != null ){
					$( this.mask ).remove();
                    this.u(
                        this.mask,
        				'click'
        			);
				}
				// Clear search text
				if(	this.filter.length > 0 ){
					this.search.value = '';
					this.filter = '';
					// Dropdown will need to be rebuilt next time
					this.d_built = false;
				}
				// Remove key event listeners
				this.u(
                    document.body,
					'keydown'
				);
                this.u(
                    this.search,
					'input'
				);
				// Don't bother to update the dropdown
				this.ClearSearchTimeout();
				//var parent = this.e.parentNode;
				// while( parent != null ){
				// 	parent.removeEventListener( 'scroll', this.scroll_listener );
				// 	parent = parent.parentNode;
				// }
                $( this.e ).trigger( 'hide-dropdown' );
			},
			/**
			 * Listen for any key pressed (while dropdown is open)
			 */
			ListenForKeyPress: function( event ){
				var k = event.keyCode;
				if(
					k == 27 // Escape
					||
					k == 9 // Tab
				){
					this.HideDropdown();
				}
				if(
					k == 38 // Up
					||
					k == 40 // Down
				){
					event.stopPropagation();
					event.preventDefault();
					if( k == 40 ){
						if( this.current_selected === false ){
							this.current_selected = 0;
						} else {
							if( this.current_selected + 1 >= this.list.querySelectorAll( 'li' ).length ){
								return;
							}
							$( this.list ).find( 'li:nth-child(' + (this.current_selected + 1).toString() + ')' ).removeClass( 'ioselect-current' );
							this.current_selected++;
						}
					} else {
						if( this.current_selected === false || this.current_selected === 0 ){
							return;
						} else {
							$( this.list ).find( 'li:nth-child(' + (this.current_selected + 1).toString() + ')' ).removeClass( 'ioselect-current' );
							this.current_selected--;
						}
					}
					var current = $( this.list ).find( 'li:nth-child(' + (this.current_selected + 1).toString() + ')' )[0];
					$( current ).addClass( 'ioselect-current' );
					// Make sure currently-selected item is in view
					if( current.offsetTop - current.parentNode.scrollTop < 0 ){
						current.parentNode.scrollTop = current.offsetTop;
					} else if( current.offsetTop + current.offsetHeight > this.list.scrollTop + this.list.offsetHeight ) {
						current.parentNode.scrollTop = (current.offsetTop + current.offsetHeight) - this.list.offsetHeight;
					}
				}
				if(
					k == 13 // Enter
				){
					if( this.current_selected !== false ){
						$( this.list ).find( 'li:nth-child(' + (this.current_selected + 1).toString() + ')' )[ 0 ].click();
					}
				}
			},
			/**
			 * An option was clicked
			 */
			ClickOption: function( event ){
				event.stopPropagation();
				if(
                    (
                        ( !this.is_multiple )
                        &&
                        $( event.target ).hasClass( 'ioselect-selected' )
                    )
                    ||
                    $( event.target ).hasClass( 'ioselect-disabled' )
                    ||
                    event.target.tagName == 'INPUT'
                ){
					return;
				}
				var option = $( event.target ).closest( '.ioselect-option,.ioselect-optgroup' );
				if( option.length == 0 ){
					return;
				}
                if( option.hasClass( 'ioselect-optgroup' ) ){
                    $( this.e ).trigger( 'optgroup-click', [ option[ 0 ], 'asd' ] );
                    return;
                }
				var value = option[0].getAttribute( 'data-value' );
				// Update original select
				if ( this.is_multiple ) {
					if( value.length == 0 ){
						return;
					}
			        // Convert string to array
			        if ( $.isArray( value ) !== '[object Array]' ) {
			            value = [value];
			        }
			        for( var i = 0; i < value.length; i++ ){
			            var options = this.e.find( 'option[value="' + value[ i ].toString()  + '"]' );
			            for( var o = 0; o < options.length; o++ ){
                            if( options[ o ].selected ){
                                options[ o ].selected = false;
                                $( event.target ).removeClass( 'ioselect-selected' );
                            } else {
                                options[ o ].selected = true;
                                $( event.target ).addClass( 'ioselect-selected' );
                            }
			            }
			        }
			    } else {
			        var options = this.e.find( 'option[value="' + value.toString()  + '"]' );
                    $( this.d ).find( '.ioselect-selected' ).removeClass( 'ioselect-selected' );
			        for( var o = 0; o < options.length; o++ ){
			            options[ o ].selected = true;
                        $( event.target ).addClass( 'ioselect-selected' );
			        }
			    }
                if( !this.is_mobile ){
                    this.HideDropdown();
                }

				$( this.e ).trigger( 'change' );
			},
			/**
			 * Remove an item from multiple select
			 */
			RemoveSelectedItem: function( event ){
				event.stopPropagation();
				var index = Array.prototype.indexOf.call(event.target.parentNode.childNodes, event.target);
				var option = this.e.find( 'option:checked' )[ index ];
				option.selected = false;
				if( this.d_built ){
					$( this.list ).find( '[data-value="' + option.value + '"]' ).removeClass( 'ioselect-selected' );
				}
				$( this.e ).trigger( 'change' );
			},
			/**
			 * (Re)build the dropdown
			 */
			BuildDropdown: function(){
				this.ClearSearchTimeout();
				// Get options
				var options = this.e.find( 'option, optgroup' );

				// Using string and innerHTML is much faster to render
				// ...than creating individual DOM nodes
				var options_html = '';
                var optgroup_index = 1;
				for( var i = 0; i < options.length; i++ ){
					var option = options[i];
                    var disabled = '';
                    if( option.getAttribute( 'disabled' ) !== null ){
                        disabled = ' ioselect-disabled'
                    }
                    if( option.nodeName == 'OPTION' ){
                        // Don't show blank options
                        if ( this.is_multiple && option.value.trim() == '' ) {
                            continue;
                        }
                        // Filter?
    					if( this.filter.length > 0 ){
    						if( !this.ApplySearchFilter( option.innerText ) ){
    							continue;
    						}
    					}
    					var selected = '';
    					if( option.selected ){
    						selected = ' ioselect-selected';
    					}
    					options_html += '<li class="ioselect-option ioselect-ns' + disabled + selected + '" data-value="' + option.value + '">' + ((option.text != '')?option.text:'&nbsp;') + '</li>';
                    } else {
                        options_html += '<li class="ioselect-optgroup ioselect-ns' + disabled + '" data-ioselect-optgroup-index="' + optgroup_index.toString() + '">' + option.innerText + '</li>';
                        optgroup_index++;
                    }
				}

				this.list.innerHTML = options_html;

				this.d_built = true;
				this.list.scrollTop = 0;
			},
            GetDropdown:function(){
                return this.d;
            },
            ApplySearchFilter:function( text ){
                if( this.o.search_in_text ){
                    return ( text.toLowerCase().indexOf( this.filter.toLowerCase() ) !== -1 );
                } else {
                    return ( text.toLowerCase().indexOf( this.filter.toLowerCase() ) === 0 );
                }
            },
			Update: function(){
				this.d_built = false;
				this.UpdateSelect();
			},
			/**
			 * Update the text shown in the select area
			 */
			UpdateSelect: function(){
                // We can't use jQuery here, because if we do it'll cause
                // an infinite loop on the MutationObserver
                // so querySelectorAll will have to do
    			var selected = this.e[ 0 ].querySelectorAll( 'option:checked' );
                $( this.select ).removeClass( 'ioselect-placeholder' );
				if ( this.is_multiple ) {
					var values = '';
			        for( var i = 0; i < selected.length; i++ ){
                        if ( selected[ i ].hasAttribute( 'value' ) && selected[ i ].getAttribute( 'value' ).trim() != '' ) {
			                values += '<span class="ioselect-selected-item">' + ((selected[ i ].innerText != '')?selected[ i ].innerText:'&nbsp;') + '</span>';
			            }
			        }
					this.select.innerHTML = values;
					var items = $( this.select ).find( '.ioselect-selected-item' );
					for( var i = 0; i < items.length; i++ ){
						this.b( items[ i ], 'click', this.RemoveSelectedItem.bind( this ) );
					}
				} else {
                    var text = '';
					// None selected, use first
					if( selected.length == 0 ){
						var selected = this.e.find( 'option' );
                    }
                    // Might not be any options at all
                    if( selected.length > 0 ){
                        var text = selected[0].innerText;
                    }
                    if( text == '' ){
                        text = '&nbsp;';
                        if( this.e[ 0 ].getAttribute( 'placeholder' ) ){
                            text = this.e[ 0 ].getAttribute( 'placeholder' );
                            $( this.select ).addClass( 'ioselect-placeholder' );
                        }
                    }
                    this.select.innerHTML = text;

				}
				if( this.e[ 0 ].disabled ){
					$( this.c ).addClass( 'ioselect-disabled' );
                    this.HideDropdown();
                } else {
                  $( this.c ).removeClass( 'ioselect-disabled' );
                }
			},
			/**
			 * Listen for changes to the search input
			 */
			Search: function(){
				// Has the filter text changed?
				if( this.filter != this.search.value ){
					// Cancel any pending update
					if( this.search_timeout != null ){
						this.ClearSearchTimeout();
					}
					// Update the filter
					this.filter = this.search.value;
					// Set a timeout to update the dropdown
					this.search_timeout = setTimeout( function(){ this.search_timeout = null; this.BuildDropdown(); }.bind(this), 200 );
				}

			},
			/**
			 * Remove a build redraw timeout
			 */
			ClearSearchTimeout: function(){
				clearTimeout( this.search_timeout );
				this.search_timeout = null;
			},
			Scroll: function(){
                if( this.is_mobile ){
                    return;
                }

				var position = $( this.c ).offset();
				if( this.current_top !== position.top ){
					this.HideDropdown();
				}
			},
            Destroy:function(){
                // Clear listeners
                this.u();

                // Remove MutationObserver
                if( this.mutation_observer ){
                    this.mutation_observer.disconnect();
                }

                // Remove element
                this.c.remove();
                this.d.remove();
                this.mask.remove();

                // Show original element
                this.e.removeClass( 'ioselect-hidden' );
                $( this.e ).trigger( 'destroyed' );
            }
		}

		return ioselect;
	}
)
);

// Polyfill for Element.matches
Element.prototype.matches = Element.prototype.matches ||
	Element.prototype.matchesSelector ||
	Element.prototype.webkitMatchesSelector ||
	Element.prototype.msMatchesSelector ||
	function (selector) {
	    var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
	    while (nodes[++i] && nodes[i] !== node);
	    return !!nodes[i];
	};
