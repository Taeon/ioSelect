<?php
$options_first = '';
$options_second = '';
for( $i = 1; $i <= 2000; $i++ ){
	$options_first .= '<option value="' . $i . '">first-' . $i . '</option>';
	$options_second .= '<option value="' . $i . '">second-' . $i . '</option>';
}
?>
<!DOCTYPE html>
<html>
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="/src/css/ioselect.css?<?=date('U')?>"/>
		<script type="text/javascript" src="/src/js/ioselect.js?<?=date('U')?>"></script>
		<script type="text/javascript">
		function ready(fn) {
			if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
				fn();
			} else {
				document.addEventListener('DOMContentLoaded', fn);
			}
		}
		ready(
			function(){
var start = new Date();
				var selects = document.querySelectorAll( 'select' );
				for( var i = 0; i < selects.length; i++ ){
					var foo = new ioselect( selects[ i ] );
					selects[ i ].addEventListener(
						'change',
						function(){
							console.log( this.value );
						}
					);
//					selects[ i ].innerHTML= '<option value="11">11</option>';
				}
var end = new Date();
console.log(end-start);
			}
		)
		</script>
	</head>
	<body>
		<form style="height: 200px;width: 500px;border:1px solid red;overflow-y:auto; position:absolute;top: 100px; left: 100px;">
			<div>
				<select name="first">
					<?=$options_first?>
				</select>
			</div>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<br/>
			<div>
				<select name="second" multiple>
					<?=$options_second?>
				</select>
			</div>
		</form>
	</body>
</html>
