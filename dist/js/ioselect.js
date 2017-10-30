// TODO: display dropdown fullscreen on mobile
// TODO: events
// TODO: OPTGROUP support
// TODO: respond to select focus (tabindex)

// Possible features...
// TODO: No results text
// TODO: limit number of selections in select multiple
// TODO: focus on label click
// TODO: deselect on single select (i.e. set to first blank option)?


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
// NINJA //
		var ioselect = function( element, options ){
            this.listeners = [];

            this.options = {
                search_min: 0
            }

			$( element ).addClass( 'ioselect-hidden' );
			this.element = $( element );
            this.is_multiple = typeof this.element[ 0 ].getAttribute( 'multiple' ) != 'undefined' && this.element[ 0 ].getAttribute( 'multiple' ) != null;

            this.options = {
                search_min: 0, // Lower limit for showing seach box. Zero means 'always'
                search: true // Set to false to never show search box
            };

            // Overwrite options passed in on constructor
            if( typeof options !== 'undefined' ){
                for( var index in options ){
                    this.options[ index ] = options[ index ];
                }
            }

            // Grab any options from the element
            // https://stackoverflow.com/questions/36971998/can-i-get-all-attributes-that-begin-with-on-using-jquery
            [].slice.call(this.element[0].attributes).filter(function(attr) {
            	return attr && attr.name && attr.name.indexOf('data-ioselect-') === 0
            }).forEach(function(attr) {
            	this.options[attr.name.substr(14).replace( /\-/, '_' )] = attr.value;
            }.bind(this));
            this.options.search_min = parseInt( this.options.search_min );
            this.options.search = this.options.search && this.options.search !== '0';

			this.element[ 0 ].removeAttribute( 'tabindex' );
			var container = $( '<div class="ioselect-container"><div class="ioselect-select ioselect-ns' + ((this.multiple)?' ioselect-multiple':'') + '"></div><div class="ioselect-dropdown"><div class="ioselect-search"><input tabindex="-1" type="text" class="ioselect-input" autocorrect="off" autocapitalize="off"></div><ul></ul></div>' );
			$( container ).insertBefore( element );

			// The outer container for the replacement selector
			var parent = $( this.element[ 0 ].parentNode );
			this.container = parent.find( '.ioselect-container' )[0];

			// The dropdown -- we'll build it later
			this.dropdown = parent.find( '.ioselect-dropdown' )[0];

			this.list = parent.find( '.ioselect-dropdown ul' )[0];
			this.search = parent.find( '.ioselect-dropdown input[type=text]' )[ 0 ];
			this.dropdown_built = this.current_selected = false;

			// The replacement select element
			this.select = parent.find( '.ioselect-select' )[0];

			// We append this to the body because otherwise there are issues with
			// clipping when the select is inside an element with overflow set
			$( document.body ).append( this.dropdown );


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
                    this.element[ 0 ],
                    {
                        childList: true,
                        attributes: true
                    }
                );
            }

            // Update when the form is reset
			this.bind(
                this.element.closest( 'form' ),
                'reset',
                this.Reset.bind(this)
			);

            // Listen for click
            this.bind(
                $( this.dropdown ),
                'click',
                this.ClickOption.bind( this )
			);
            // Listen for click
            this.bind(
                $( this.select ),
                'click',
                this.ClickSelect.bind(this)
			);

            this.bind(
                this.element,
                'change',
				this.Update.bind( this )
			);

			// Stores a delay when updating dropdown due to search filter change
			this.search_timeout = null;

            // Update the text showing in the select area
            this.UpdateSelect();
			//this.scroll_listener = function(event){this.HideDropdown();}.bind(this);
            $( this.element ).trigger( 'ready' );

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
                this.bind( this.element, event, _func );
            },
            off:function( event, func ){
                this.unbind( this.element, event, func );
            },
            /**
             * Add an event listener and store a record of it for removal later
             *
             * @param       HTMLElement     element
             * @param       string          event
             @ @param       function        func
             */
            bind:function( element, event, func ){
                this.listeners.push( {element:$(element)[0],event:event,func:func} );
                $( element ).on( event, func );
            },
            /**
             * Remove an event listener
             *
             * @param       HTMLElement     element     [Optional] Element to unbind event from. If undefined, all elements will be unbound
             * @param       string          event       [Optional] The event to remove - if missing, all event listeners will be removed
             @ @param       function        func        [Optional] The listener to be removed -- if missing, all listeners for this event will be removed
             */
            unbind:function( element, event, func ){
                element = $(element)[0];
                var listeners = [];
                // Loop through all listeners, looking for a match
                for( var i = 0; i < this.listeners.length; i++ ){
                    var listener = this.listeners[ i ];
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
                this.listeners = listeners;
            },
            /**
             * Mutation observer listener
             */
            SelectMutated: function( mutations ){
				for( var i = 0; i < mutations.length; i++ ){
                    this.HideDropdown();
					switch( mutations[i].type ){
						case 'childList':{
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
				// To avoid roudning errors...
				this.container.style.width = 'auto';
				this.container.style.width = this.container.offsetWidth + 'px';
				this.dropdown.style.width = this.container.offsetWidth + 'px';
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
				if( $( this.container ).hasClass( 'ioselect-disabled' ) ){
					return;
				}
				if( $( this.container ).hasClass( 'ioselect-open' ) ){
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
				if( !this.dropdown_built ){
					this.BuildDropdown();
				}

				this.current_selected = false;
				this.bind( window, 'resize', this.Resize.bind(this) );
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
                this.bind(
                    this.mask,
    				'click',
                    this.HideDropdown.bind( this )
    			);

				// Listen for keypresses (escape, tab)
				this.bind(
                    document.body,
					'keydown',
					this.ListenForKeyPress.bind(this)
				);

                if(
                    (
                        this.options.search_min > 0
                        &&
                        this.element.find( 'option' ).length < this.options.search_min
                    )
                    ||
                    !this.options.search
                ){
                    // Listen for search input
    				$( this.search ).addClass( 'ioselect-hidden' );
                } else {
                    // Listen for search input
    				this.bind(
                        this.search,
    					'input',
    					this.Search.bind(this)
    				);
                    $( this.search ).removeClass( 'ioselect-hidden' );
                }
				this.scroll_listener_interval = setInterval(
					this.Scroll.bind(this),
					10
				)

				// Hide the dropdown on scroll
				// var parent = this.element.parentNode;
				// while( parent != null ){
				// 	parent.addEventListener( 'scroll', this.scroll_listener );
				// 	parent = parent.parentNode;
				// }

				this.list.scrollTop = 0;

				this.Resize();
                $( this.element ).trigger( 'show-dropdown' );
			},
			SetDropdownPosition: function(){
				var position = $( this.container ).offset();

				this.current_top = position.top;

				this.dropdown.style.top = ( this.current_top + this.select.offsetHeight ).toString() + 'px';
				this.dropdown.style.left = position.left.toString() + 'px';
				$( this.container ).addClass( 'ioselect-open' );
				$( this.dropdown ).addClass( 'ioselect-open' );

				// See if it's dropping off the bottom of the screen
				var dropdown_top = this.current_top - document.documentElement.scrollTop;
				var dropdown_height = this.dropdown.offsetHeight;
				var viewport_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);;
				if ( dropdown_top + dropdown_height > viewport_height ) {
					// Put it above the select
					this.dropdown.style.top = position.top + 'px';
					$( this.container ).addClass( 'ioselect-select-up' );
					$( this.dropdown ).addClass( 'ioselect-drop-up' );
				}
			},
			/**
			 * Hide the dropdown
			 */
			HideDropdown: function( event ){
				clearInterval( this.scroll_listener_interval );
				this.unbind( window, 'resize' );
				this.container.style.width = 'auto';
				if( this.current_selected !== false ){
					$( 'li:nth-child(' + (this.current_selected + 1).toString() + ')' ).removeClass( 'ioselect-current' );
					this.current_selected = false;
				}

				// Reset viewport meta
				if( this.current_meta ){
					$('meta[name="viewport"]')[ 0 ].content = this.current_meta.join(',');
				}
				if( !$( this.container ).hasClass( 'ioselect-open' ) ){
					return;
				}
				// Remove classes
				$( this.container ).removeClass( 'ioselect-open ioselect-select-up' );
                $( this.dropdown ).removeClass( 'ioselect-open ioselect-drop-up' );
				// Hide the mask
				if( this.mask.parentNode != null ){
					$( this.mask ).remove();
                    this.unbind(
                        this.mask,
        				'click'
        			);
				}
				// Clear search text
				if(	this.filter.length > 0 ){
					this.search.value = '';
					this.filter = '';
					// Dropdown will need to be rebuilt next time
					this.dropdown_built = false;
				}
				// Remove key event listeners
				this.unbind(
                    document.body,
					'keydown'
				);
                this.unbind(
                    this.search,
					'input'
				);
				// Don't bother to update the dropdown
				this.ClearSearchTimeout();
				//var parent = this.element.parentNode;
				// while( parent != null ){
				// 	parent.removeEventListener( 'scroll', this.scroll_listener );
				// 	parent = parent.parentNode;
				// }
                $( this.element ).trigger( 'hide-dropdown' );
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
				if( $( event.target ).hasClass( 'ioselect-selected' ) || $( event.target ).hasClass( 'ioselect-disabled' ) || event.target.tagName == 'INPUT' ){
					return;
				}
				var option = $( event.target ).closest( '.ioselect-option,.ioselect-optgroup' );
				if( option.length == 0 ){
					return;
				}
                if( option.hasClass( 'ioselect-optgroup' ) ){
                    $( this.element ).trigger( 'optgroup-click', [ option[ 0 ], 'asd' ] );
                    return;
                }
				var value = option[0].getAttribute( 'data-value' );
				// Update original select
				if ( this.multiple ) {
					if( value.length == 0 ){
						return;
					}
			        // Convert string to array
			        if ( $.isArray( value ) !== '[object Array]' ) {
			            value = [value];
			        }
			        for( var i = 0; i < value.length; i++ ){
			            var options = this.element.find( 'option[value="' + value[ i ].toString()  + '"]' );
			            for( var o = 0; o < options.length; o++ ){
			                options[ o ].selected = true;
			            }
			        }
					$( event.target ).addClass( 'ioselect-selected' );
			    } else {
			        var options = this.element.find( 'option[value="' + value.toString()  + '"]' );
			        for( var o = 0; o < options.length; o++ ){
			            options[ o ].selected = true;
			        }
			    }
				$( this.element ).trigger( 'change' );
				this.HideDropdown();
			},
			/**
			 * Remove an item from multiple select
			 */
			RemoveSelectedItem: function( event ){
				event.stopPropagation();
				var index = Array.prototype.indexOf.call(event.target.parentNode.childNodes, event.target);
				var option = this.element.find( 'option:checked' )[ index ];
				option.selected = false;
				if( this.dropdown_built ){
					$( this.list ).find( '[data-value="' + option.value + '"]' ).removeClass( 'ioselect-selected' );
				}
				$( this.element ).trigger( 'change' );
			},
			/**
			 * (Re)build the dropdown
			 */
			BuildDropdown: function(){
				this.ClearSearchTimeout();
				// Get options
				var options = this.element.find( 'option, optgroup' );

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
                        // Filter?
    					if( this.filter.length > 0 ){
    						if( !(option.innerText.toLowerCase().indexOf( this.filter.toLowerCase() ) === 0) ){
    							continue;
    						}
    					}
    					var selected = '';
    					if( option.selected ){
    						selected = ' ioselect-selected';
    					}
    					options_html += '<li class="ioselect-option ioselect-ns' + disabled + selected + '" data-value="' + option.value + '">' + option.text+ '</li>';
                    } else {
                        options_html += '<li class="ioselect-optgroup ioselect-ns' + disabled + '" data-ioselect-optgroup-index="' + optgroup_index.toString() + '">' + option.innerText + '</li>';
                        optgroup_index++;
                    }
				}

				this.list.innerHTML = options_html;

				this.dropdown_built = true;
				this.list.scrollTop = 0;
			},
			Update: function(){
				this.dropdown_built = false;
				this.UpdateSelect();
			},
			/**
			 * Update the text shown in the select area
			 */
			UpdateSelect: function(){
                // We can't use jQuery here, because if we do it'll cause
                // an infinite loop on the MutationObserver
                // so querySelectorAll will have to do
    			var selected = this.element[ 0 ].querySelectorAll( 'option:checked' );
				if ( this.is_multiple ) {
					var values = '';
			        for( var i = 0; i < selected.length; i++ ){
			            if ( selected[ i ].hasAttribute( 'value' ) ) {
			                values += '<span class="ioselect-selected-item">' + selected[ i ].innerText + '</span>';
			            }
			        }
					this.select.innerHTML = values;
					var items = $( this.select ).find( '.ioselect-selected-item' );
					for( var i = 0; i < items.length; i++ ){
						this.bind( items[ i ], 'click', this.RemoveSelectedItem.bind( this ) );
					}
				} else {
					// None selected, use first
					if( selected.length == 0 ){
						var selected = this.element.find( 'option' );
					}
                    // Might not be any options at all
                    if( selected.length > 0 ){
                        this.select.innerText = selected[0].innerText;
                    }
				}
				if( this.element[ 0 ].disabled ){
					$( this.container ).addClass( 'ioselect-disabled' );
        } else {
          $( this.container ).removeClass( 'ioselect-disabled' );
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
				var position = $( this.container ).offset();
				if( this.current_top !== position.top ){
					this.HideDropdown();
				}
			},
            Destroy:function(){
                // Clear listeners
                this.unbind();

                // Remove MutationObserver
                if( this.mutation_observer ){
                    this.mutation_observer.disconnect();
                }

                // Remove element
                this.container.remove();
                this.dropdown.remove();
                this.mask.remove();

                // Show original element
                this.element.removeClass( 'ioselect-hidden' );
                $( this.element ).trigger( 'destroyed' );
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
