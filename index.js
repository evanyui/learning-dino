$(document).ready(function() {
		Learn.init(12, 4, 0.2);
		Learn.startLearning();

		//UI update
		setInterval(function() {

			var playing = runner.playing? "Playing" : "Stop";
			$('#gameStatus').text('Status: ' + playing);
			$('#generation').text('Generation: ' + Learn.generation);
			$('#genome').text('Genome: #' + Learn.genome + ' / ' + Learn.genomeUnits);
			$('#mutation').text('Mutation Prob: ' + Learn.mutationProb);
			$('#fitness').text('Fitness: ' + Math.round(runner.distanceRan));
			$('#fittest').text('Current Fittest: ' + Math.round(Learn.currentFittest));
			$('#prevFittest').text('Previous Fittest: ' + Math.round(Learn.prevFittest));
			$("#genomes").empty();
			Learn.genomes.forEach(function(genome) {
				$("#genomes").append('<li>Genome #'+Learn.genomes.indexOf(genome)+': '+Math.round(genome.fitness)+'</li>');
			});
			if(runner.horizon.obstacles.length>0) {
				$('#distance').text('Distance: ' + Math.round(runner.horizon.obstacles[0].xPos));
				$('#size').text('Size: ' + Math.round(150-runner.horizon.obstacles[0].yPos));
			} else {
				$('#distance').text('Distance: NaN');
				$('#size').text('Size: NaN');
			}
			$('#speed').text('Speed: ' + Math.round(runner.currentSpeed));
			$('#output').text('Output: ' + Learn.currentOutput);
			$('#action').text('Action: ' + getDiscreteStateName(Learn.currentOutput));

			scrollDownLog();
		}, 100);

});

var getDiscreteStateName = function(value) {
	if (value < 0.45) {
    return "duck";
  } else if(value > 0.55) {
    return "jump";
  }

  return "none";
}

var scrollDownLog = function (){
    var element = document.getElementById("logs");
    element.scrollTop = element.scrollHeight;
}

var prevMsgs = "";
var dotCount = 1;
var write = function(msgs) {
	if(msgs!=prevMsgs) {
		$("#logs").append('<li>'+msgs+'</li>');
	} else {
		$("#logs li:last-child").text(msgs);
		for(var i = 0; i < dotCount; i++) {
			$("#logs li:last-child").append('.');
		}
		dotCount++;
		if(dotCount > 3) {
			dotCount = 1;
		}

	}
	prevMsgs = msgs;
}
