var jump_e = $.Event("keydown", { keyCode: 32});
var down_e = $.Event("keydown", { keyCode: 40});
var none_e = $.Event("keydown", { keyCode: 0});
// runner.onKeyDown(e);

var startNewGame = function(next) {
  setTimeout(function() {
    // Once reloaded we wait 0.5sec for it to let us start the game with a space.
		$(this).trigger(jump_e);
   	runner.onKeyDown(jump_e);
		runner.restart();
		next && next();
  }, 500);

}

var setGameOutput = function (output) {
	var gameOutput = getDiscreteState(output);
	$(this).trigger(gameOutput);
	runner.onKeyDown(gameOutput);
}

var getDiscreteState = function (value){
  if (value < 0.45) {
    return down_e;
  } else if(value > 0.55) {
    return jump_e;
  }

  return none_e;
}
