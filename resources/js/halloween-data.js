var com = {};

com.javecross = {};


com.javecross.HalloweenParser = (function() {
	
	var halloweenResults,
		halloweenParticipants,
		totalRuns,
		totalCandy,
		myCurrentChart,
		totalTime,
		averageTime,
		globalFastest;

	function parseRow(rowText) {
		var rowData = {},
			tokens = rowText.split('.'),
			acc,
			param,
			value,
			time;
		if (tokens.length < 4) {
			throw new Error('Unable to parse, incorrect token count (' + tokens.length + ')!');
		}
		if (tokens[0] !== 'JaveCross' && tokens[1] !== 'halloween') {
			throw new Error('Unable to parse, not halloween data!');
		}
		if (tokens[3].indexOf('=') < 0) {
			throw new Error('Given row isn\'t formatted correctly');
		}
		if (tokens.length === 5) {
			tokens[3] = tokens[3] + '.' + tokens[4];
		}
		acc = tokens[2];
		param = tokens[3].split('=')[0];
		value = tokens[3].split('=')[1];
		// console.log( acc + ' ' + param + ': ' + value );
		if (!(acc in halloweenResults)) {
			halloweenResults[acc] = {};
			halloweenResults[acc].runs = [];
			halloweenParticipants += 1;
			halloweenResults[acc].totalTime = 0;
		}
		if (param === 'runs') {
			totalRuns += parseInt(value);
			halloweenResults[acc].totalRuns = parseInt(value);
		}
		if (param === 'totalCandy') {
			totalCandy += parseInt(value);
			halloweenResults[acc].candy = parseFloat(value);
		}
		if (parseInt(param) >= 0) {
			// It's a run time.
			time = parseFloat(value);
			halloweenResults[acc].runs.push(time);	
			totalTime += time;
			halloweenResults[acc].totalTime += time;
			if (!halloweenResults[acc].fastestTime) {
				halloweenResults[acc].fastestTime = time;
			} else {
				if (time < halloweenResults[acc].fastestTime) {
					halloweenResults[acc].fastestTime = time;
				}
			}
			if (!globalFastest) {
				globalFastest = {
					'account': acc,
					'time': time
				};
			} else {
				if (time < globalFastest.time) {
					globalFastest = {
						'account': acc,
						'time': time
					};
				}
			}
		}				
	}
	function createNewCanvasElement() {
		var width = $('.container section').width() - 15,
			canvas;
		
		$('#canvas-container').append($('<canvas>', {
			'id': 'halloween-canvas'
		}));
		canvas = $('#halloween-canvas');
		canvas.width = width;
		canvas[0].width = width;
		canvas.height = width/2;
		canvas[0].height = width/2;
		
	}
	
	function updateInformation() {
		var value = $('#account-selector').val(),
			user,
			ctx;
		if (!(value in halloweenResults)) {
			console.log('Unable to locate: ' + value);
			return;
		}
		user = halloweenResults[value];
		console.log(user);
		$('#local-runs').text(user.totalRuns);
		$('#local-candy').text(user.candy);
		$('#local-title').text(value + ' Overview');
		$('#local-avg-time').text(user.totalTime/user.totalRuns);
		$('#local-total-time').text(user.totalTime);
		$('#fast-time').text(user.fastestTime);
		$('section .local-info').removeClass('hidden');
		if ($('#halloween-canvas').length) {
			$('#halloween-canvas').remove();
		}
		console.log('Updating info for: ' + value);
		createNewCanvasElement();
		ctx = document.getElementById("halloween-canvas").getContext("2d");
		myCurrentChart = new Chart(ctx).Line(getUserDataSet(user));
	}
	
	function viewGlobalRuns() {
		$('#local-title').text('Global Quest Run Overview');
		if ($('#halloween-canvas').length) {
			$('#halloween-canvas').remove();
		}
		createNewCanvasElement();
		var ctx = document.getElementById("halloween-canvas").getContext("2d");
		myCurrentChart = new Chart(ctx).Bar(getGlobalRunsDataSet());
	}
	
	function viewGlobalCandy() {
		$('#local-title').text('Global Candy Overview');
		if ($('#halloween-canvas').length) {
			$('#halloween-canvas').remove();
		}
		createNewCanvasElement();
		var ctx = document.getElementById("halloween-canvas").getContext("2d");
		myCurrentChart = new Chart(ctx).Bar(getGlobalCandyDataSet());
	}
	function viewGlobalTimes() {
		$('#local-title').html('Global Time Overview (Average Time/Fastest Time)<br>Larger numbers are faster times');
		if ($('#halloween-canvas').length) {
			$('#halloween-canvas').remove();
		}
		createNewCanvasElement();
		var ctx = document.getElementById("halloween-canvas").getContext("2d");
		myCurrentChart = new Chart(ctx).Bar(getGlobalTimeDataSet());
	}
	
	function getUserDataSet(userInfo) {
		var data = {
				'labels': [],
				'datasets': []
			},
			dataSet = {
				'label': "User Dataset",
				'fillColor': "rgba(230, 74, 25, 0.3)",
				'strokeColor': "#FFCCBC",
				'highlightFill': "#FFEB3B",
				'highlightStroke': "#FFEB3B",
				'data': []
			};
			if (userInfo) {
				if (userInfo.runs.length) {
					$.each(userInfo.runs, function(i, val) {
						dataSet.data.push(val);
						data.labels.push(i+1);
					});
				}
			}
			data.datasets.push(dataSet);
			return data;
	}
	
	function getGlobalRunsDataSet() {
		var data = {
				'labels': [],
				'datasets': []
			},
			dataSet = {
				'label': "Global Runs Dataset",
				'fillColor': "#E64A19",
				'strokeColor': "#E64A19",
				'highlightFill': "#FFEB3B",
				'highlightStroke': "#FFEB3B",
				'data': []
			};
		
		$.each(halloweenResults, function(key, elem) {
			if (elem.totalRuns) {
				data.labels.push(key);
				dataSet.data.push(elem.totalRuns);
			}
		});
		data.datasets.push(dataSet);
		return data;
	}
	function getGlobalTimeDataSet() {
		var data = {
				'labels': [],
				'datasets': []
			},
			dataSet = {
				'label': "Global Time Dataset",
				'fillColor': "#E64A19",
				'strokeColor': "#E64A19",
				'highlightFill': "#FFEB3B",
				'highlightStroke': "#FFEB3B",
				'data': []
			};
		
		$.each(halloweenResults, function(key, elem) {
			if (elem.fastestTime && elem.fastestTime <= 700) {
				data.labels.push(key);
				dataSet.data.push(averageTime/elem.fastestTime);
			}
		});
		data.datasets.push(dataSet);
		return data;
	}
	function getGlobalCandyDataSet() {
		var data = {
				'labels': [],
				'datasets': []
			},
			dataSet = {
				'label': "Global Candy Dataset",
				'fillColor': "#E64A19",
				'strokeColor': "#E64A19",
				'highlightFill': "#FFEB3B",
				'highlightStroke': "#FFEB3B",
				'data': []
			};
		
		$.each(halloweenResults, function(key, elem) {
			if (elem.candy) {
				data.labels.push(key);
				dataSet.data.push(elem.candy);
			}
		});
		data.datasets.push(dataSet);
		return data;
	}

	return {
		loadResultsData: function () {
			var rows = $('#data').text().split('\n'),
				i,
				size,
				row,
				rowData
				;
			halloweenResults = {};
			halloweenParticipants = 0;
			totalRuns = 0;
			totalCandy = 0;
			totalTime = 0;
			
			for (i = 0, size = rows.length; i < size; i++) {
				row = rows[i];
				if (!row.trim().length) {
					continue;
				}
				try {
					rowData = parseRow(row);
				} catch (Error) {
					//console.log('Row is not parseable: ' + row + ', ' + Error);
				}
			}
			averageTime = totalTime / totalRuns;
		},
		buildResultDisplay: function () {
			createNewCanvasElement();
			$('#account-selector').on('change', function() {
				updateInformation();
			});
			$('#total-parts').text(halloweenParticipants);
			$('#total-runs').text(totalRuns);
			$('#total-candy').text(totalCandy);
			$('#avg-time').text(averageTime/60 + ' minutes');
			$('#total-time').text(totalTime/60/60 + ' hours');
			$('#global-fastest').text(globalFastest.account + ': ' + globalFastest.time + ' seconds');
			$.each(halloweenResults, function (key, _) {
				$('#account-selector').append($('<option>', { 
					value: key,
					text : key 
				}));
			});
			$('#account-selector').val('shyguy2');
			
			$('#see-candy').on('click', function() {
				viewGlobalCandy();
			});
			$('#see-runs').on('click', function() {				
				viewGlobalRuns();
			});
			$('#see-times').on('click', function() {
				viewGlobalTimes();
			});
			viewGlobalCandy();			
		},
		getHalloweenResults: function () {
			return halloweenResults;
		},
		
	}
})();

$(document).ready(function() {
	var parser = com.javecross.HalloweenParser;
	
	parser.loadResultsData();
	parser.buildResultDisplay();		
});
