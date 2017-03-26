var	Network = synaptic.Network,
		Architect = synaptic.Architect,
		computation;

// $(document).ready(function() {
//     $(this).on('keydown', function(event) {
//         if (event.keyCode == 13) { //enter pressed
//
//         }
//     });
// })

//TODO: (1) Neural network change too smaller.
//			(2) Genomes UI display bug: displayed 4 prev fittest genomes. have to be cleared.
//			(3) Implement check experience gain.
//			(4) Consider distance difference include sprite size.
var Learn = {

  // Array of networks for generation ith Genomes
  genomes: [],

  // Current runnning genome/generation/fittest so far/fittest from last generation
  genome: 0,
  generation: 0,
	currentFittest: 0,
	prevFittest: 0,

  // Set this, to verify genome experience BEFORE running it
  shouldCheckExperience: false,

};

$(document).ready(function() {
	// Initialize the Learner
	Learn.init = function (genomeUnits, selection, mutationProb) {
		write("Initializing Learn...");
	  Learn.genome = 0;
	  Learn.generation = 0;

	  Learn.genomeUnits = genomeUnits;
	  Learn.selection = selection;
	  Learn.mutationProb = mutationProb;
	}

	// Build initial genomes
	Learn.startLearning = function () {
		write("Learn Start");
	  while (Learn.genomes.length < Learn.genomeUnits) {
	    Learn.genomes.push(Learn.buildGenome(3, 1));
	  }

	  Learn.executeGeneration();
	}

	//make neural networks
	Learn.buildGenome = function (inputs, outputs) {
		write("Building neural network...");
	  var network = new Architect.Perceptron(inputs, 4, 4, outputs);

	  return network;
	}

	// Given the the array genomes,
	// apply method `executeGenome` for each genome.
	// After all genomes have completed, execute:
	//
	// 1) Select best genomes (Choose 4)
	// 2) Does cross over (except for 2 genomes)
	// 3) Does Mutation-only on remaining genomes and fill up the genomes for next generation
	// 4) Execute next generation
	Learn.executeGeneration = function (){

	  Learn.generation++;
		write("=====================================");
		write("Execute generation " + Learn.generation);
		Learn.currentFittest = 0;
	  Learn.genome = 0;

	  async.mapSeries(Learn.genomes, Learn.executeGenome, function (argument) {

	    // Kill worst genomes
	    Learn.genomes = Learn.selectBestGenomes(Learn.selection);

	    // Copy best genomes
	    var bestGenomes = _.clone(Learn.genomes);
			prevFittest = bestGenomes[0].fitness;
	    // Cross Over
	    while (Learn.genomes.length < Learn.genomeUnits - 2) {
	      // Get two random Genomes
	      var genA = _.sample(bestGenomes).toJSON();
	      var genB = _.sample(bestGenomes).toJSON();

	      // Cross over and Mutate
	      var newGenome = Learn.mutate(Learn.crossOver(genA, genB));

	      // Add to generation
	      Learn.genomes.push(Network.fromJSON(newGenome));

				write("Crossed new genome");
	    }

	    // Mutation-only
	    while (Learn.genomes.length < Learn.genomeUnits) {
	      // Get one random Genomes
	      var gen = _.sample(bestGenomes).toJSON();

	      // Mutate
	      var newGenome = Learn.mutate(gen);

	      // Add to generation
	      Learn.genomes.push(Network.fromJSON(newGenome));

				write("Mutated new genome");
	    }

			write("=====================================");

	    // Execute next generation
	    Learn.executeGeneration();
	  });
	}

	// Sort all the genomes, and delete the worst one
	// untill the genome list has selectN elements.
	Learn.selectBestGenomes = function (selectN){
	  var selected = _.sortBy(Learn.genomes, 'fitness').reverse();

	  while (selected.length > selectN) {
	    selected.pop();
	  }

	  return selected;
	}

	// Does random mutations across all
	// the biases and weights of the Networks
	// (This must be done in the JSON to
	// prevent modifying the current one)
	Learn.mutate = function (net){
	  // Mutate
	  Learn.mutateDataKeys(net.neurons, 'bias', Learn.mutationProb);
	  Learn.mutateDataKeys(net.connections, 'weight', Learn.mutationProb);

	  return net;
	}

	// Given an Array of objects with key `key`,
	// and also a `mutationRate`, randomly Mutate
	// the value of each key if random value is
	// lower than mutationRate for each element.
	Learn.mutateDataKeys = function (a, key, mutationRate){
	  for (var k = 0; k < a.length; k++) {
	    // Should mutate?
	    if (Math.random() > mutationRate) {
	      continue;
	    }

	    a[k][key] += a[k][key] * (Math.random() - 0.5) * 3 + (Math.random() - 0.5);
	  }
	}

	// Mating genomes. Crossing their Neural Network.
	// Those two methods convert from JSON to Array, and from Array to JSON
	Learn.crossOver = function (netA, netB) {
	  // Swap (50% prob.)
	  if (Math.random() > 0.5) {
	    var tmp = netA;
	    netA = netB;
	    netB = tmp;
	  }

	  // Clone network
	  netA = _.cloneDeep(netA);
	  netB = _.cloneDeep(netB);

	  // Cross over data keys
	  Learn.crossOverDataKey(netA.neurons, netB.neurons, 'bias');

	  return netA;
	}

	// Given an Object A and an object B, both Arrays
	// of Objects:
	//
	// 1) Select a cross over point (cutLocation)
	//    randomly (going from 0 to A.length)
	// 2) Swap values from `key` one to another,
	//    starting by cutLocation
	Learn.crossOverDataKey = function (a, b, key) {
	  var cutLocation = Math.round(a.length * Math.random());

	  var tmp;
	  for (var k = cutLocation; k < a.length; k++) {
	    // Swap
	    tmp = a[k][key];
	    a[k][key] = b[k][key];
	    b[k][key] = tmp;
	  }
	}

	// Waits the game to end, and start a new one, then:
	// 1) Take input data from game
	// 2) On data read, applies the neural network, and
	//    set it's output
	// 3) When the game has ended and compute the fitness
	Learn.executeGenome = function (genome, next){
		write("-------------------------------------");
		write("Execute genome #" + (Learn.genomes.indexOf(genome)+1));
	  Learn.genome = Learn.genomes.indexOf(genome) + 1;

	  // Check if genome has AT LEAST some experience
	  // if (Learn.shouldCheckExperience) {
	  //   if (!Learn.checkExperience(genome)) {
	  //     genome.fitness = 0;
	  //     // Learn.ui.logger.log('Genome '+Learn.genome+' has no min. experience');
	  //     return next();
	  //   }
	  // }

		computation = setInterval(function(){

			if(!runner.playing || runner.crashed) {

				write("Finish");
				clearInterval(computation);

				//fitness is the distance trex ran in pixel
				genome.fitness = runner.distanceMeter.getActualDistance(Math.ceil(runner.distanceRan));
				write("Result: " + genome.fitness);

				if(genome.fitness > Learn.currentFittest) {
					Learn.currentFittest = genome.fitness;
					write("Result is fittest!");
				}

				write("-------------------------------------");
				// next && next();
		    startNewGame(next);
			}

			write("Computing network...");
			var inputs;
			if(runner.horizon.obstacles.length>0) {
				inputs = [
					Math.ceil(runner.horizon.obstacles[0].xPos-runner.tRex.xPos),
					Math.ceil(150-runner.horizon.obstacles[0].yPos),
					runner.currentSpeed
				];
			} else {
				inputs = [
					9999,
					0,
					runner.currentSpeed
				];
			}
			// Apply to network
			var outputs = genome.activate(inputs);
			setGameOutput(outputs[0]);
		}, 1000/60);

	}

	// // Validate if any acction occur uppon a given input (in this case, distance).
	// // If genome only keeps a single activation value for any given input,
	// // it will return false
	// Learn.checkExperience = function (genome) {
	//
	//   var step = 0.1, start = 0.0, stop = 1;
	//
	//   // Inputs are default. We only want to test the first index
	//   var inputs = [0.0, 0.3, 0.2];
	//   var activation, state, outputs = {};
	//
	//   for (var k = start; k < stop; k += step) {
	//     inputs[0] = k;
	//
	//     activation = genome.activate(inputs);
	//     state = Learn.gm.getDiscreteState(activation);
	//
	//     outputs[state] = true;
	//   }
	//
	//   // Count states, and return true if greater than 1
	//   return _.keys(outputs).length > 1;
	// }
});
