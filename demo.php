<!DOCTYPE html>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="/src/css/ioselect.css?<?=date('U')?>"/>
		<link rel="stylesheet" type="text/css" href="/src/css/theme-basic.css?<?=date('U')?>"/>
		<!--script  src="https://code.jquery.com/jquery-2.2.4.min.js"  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="  crossorigin="anonymous"></script-->

		<!--script src="https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.js"></script-->

		<!--script type="text/javascript" src="/dist/js/ioselect.js?<?=date('U')?>"></script-->
		<script type="text/javascript" src="/src/js/ioselect.js?<?=date('U')?>"></script>
		<script type="text/javascript" src="/lib/ninja.js?<?=date('U')?>"></script>
		<script type="text/javascript">
		function ready(fn) {
			if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
				fn();
			} else {
				document.addEventListener('DOMContentLoaded', fn);
			}
		}
		var foo = [];
		ready(
			function(){
var start = new Date();
				var selects = document.querySelectorAll( 'select.ioselect' );
				for( var i = 0; i < selects.length; i++ ){
					var ios = new ioselect( selects[ i ], {search:true,search_in_text:true,search_min: 10} );
					foo.push( ios );
					selects[ i ].addEventListener(
						'change',
						function(){
							console.log( this.value );
						}
					);
					ios.on( 'show-dropdown', function(){console.log('show')} );
					ios.on( 'hide-dropdown', function(){console.log('hide')} );
					ios.on( 'optgroup-click', function(){console.log( arguments )} );
//					selects[ i ].innerHTML= '<option value="11">11</option>';
				}
var end = new Date();
console.log(end-start);
			}
		)

		Destroy = function(){
			for( var i = 0; i < foo.length; i++ ){
				foo[i].Destroy();
			}
		}
		</script>
	</head>
	<body style="min-height:200vh">
		<h1>ioSelect</h1>
		<p>ioSelect is an easily-customisable replacement for the HTML select element.</p>
		<h2>Simple initalisation</h2>
<button onclick="Destroy()">Destroy</button>
		<form>
			<div>
				<select>
					<option value="apples">Apples</option>
					<option value="apples">Apples</option>
					<option disabled value="oranges">Oranges</option>
					<option value="grapes">Grapes</option>
					<option value="lemons">Lemons</option>
					<option value="bananas">Bananas</option>
				</select>
				<div style="position: absolute; left: 200px; top: 200px; height: 500px; width:43.6284333%; margin-right: 5%;">
				<select id="first" class="ioselect" data-ioselect-dropdown-class="foobar" data-ioselect-close-on-click-mobile="false">
					<option value=""></option>
<?php
for( $i = 0; $i < 1000; $i++  ){
	echo( '<option value="' . (string)$i . '">' . (string)$i . '</option>' );
}
?>
				</select>
			</div>
				<select multiple>
					<option value="apples">Apples</option>
					<option value="oranges">Oranges</option>
					<option value="grapes">Grapes</option>
					<option value="lemons">Lemons</option>
					<option value="bananas">Bananas</option>
				</select>
				<select multiple class="ioselect" data-ioselect-search-min="10">
					<option value="apples">Apples</option>
					<option value="oranges">Oranges</option>
					<option value="grapes">Grapes</option>
					<option value="lemons">Lemons</option>
					<option value="bananas">Bananas</option>
				</select>
			</div>
			<input type="reset" value="Reset">
		</form>
		<button onclick="document.getElementById( 'first' ).disabled = !document.getElementById( 'first' ).disabled">Disable</button>
		<button onclick="document.getElementById( 'first' ).innerHTML = ('<option value=1>1</option>')">Click</button>
	</body>
</html>
