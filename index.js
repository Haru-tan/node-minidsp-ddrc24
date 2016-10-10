let Device = require('./src/device');
const Constants = require('./src/constants');

let program = require('commander');
program
	.version('0.1')
	.option('-i --input <source>', 'Set input source', /^analog|toslink|usb$/i)
	.option('-j --inputgain [gain]', 'Sets input gain')
	.option('-g --gain [vol]','Set master gain (acceptable range -127dB to 0dB)')
	.option('-m --mute', 'Set master mute')
	.option('--unmute', 'Unset master mute')
	.option('--monitor', 'Monitor input levels')
	// .option('--proxy', 'Setup a TCP proxy on port 5333')
	.parse(process.argv);

let dsp = new Device();
let actions = [ ];

// console.log(JSON.stringify(program,null,4));

if (program.input) {
	actions.push(dsp.setInput(program.input));
}

if (program.gain) {
	let gain = program.args.length ? program.args[0] : program.gain;
	actions.push(dsp.setVolume(parseInt(gain)));
}

if (program.mute) {
	actions.push(dsp.setMute(true));
}

if (program.unmute) {
	actions.push(dsp.setMute(false));
}

if (program.inputgain) {
	let gain = program.args.length ? program.args[0] : program.inputgain;
	actions.push([ 1, 2 ]
		.map((x) => dsp.getInput(x))
		.reduce((prevVal,curVal) => 
			prevVal.then(() => curVal.setGain(gain)), Promise.resolve()
		));
}

if (program.monitor) {
	const ProgressBar = require('ascii-progress');

	var bars = [ 
		new ProgressBar({
		  schema:' 1 [:bar] :token',
		  total: 127
		}),
		new ProgressBar({
		  schema:' 2 [:bar] :token',
		  total: 127
		})
	];

	setInterval(() => {
		dsp.getInputLevels().then((levels) => {
			let convertLevel = (x) => 1 - (x/-127);

			bars[0].update(convertLevel(levels[0]), {
				token: levels[0].toFixed(1) + ' dBFS'
			});

			bars[1].update(convertLevel(levels[1]), {
				token: levels[1].toFixed(1) + ' dBFS'
			});
		});
	}, 1000/24)
}

if (actions.length) {
	Promise.all(actions)
	// Close the device so we can exit 
	.then(dsp.close.bind(dsp))
	.catch((err) => {
		console.error(e.toString());
		process.exit(1);
	});
}
