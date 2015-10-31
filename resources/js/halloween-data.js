var com = {};

com.javecross = {};


com.javecross.HalloweenParser = (function() {
	
	var halloweenResults,
		halloweenParticipants,
		totalRuns,
		totalCandy,
		myCurrentChart;

	function parseRow(rowText) {
		var rowData = {},
			tokens = rowText.split('.'),
			acc,
			param,
			value;
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
			halloweenResults[acc].runs.push(value);			
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
		},
		buildResultDisplay: function () {
			createNewCanvasElement();
			$('#account-selector').on('change', function() {
				updateInformation();
			});
			$('#total-parts').text(halloweenParticipants);
			$('#total-runs').text(totalRuns);
			$('#total-candy').text(totalCandy);
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
