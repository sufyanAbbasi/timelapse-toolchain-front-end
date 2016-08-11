var dictionary = {};
var timeSliderTimer = null;
var dataSetIndex = 0;

function initializeCustomization(){
	$('input[name=set-fast]')[0].value = parseInt(timeSliderOptions.animationRate.fast);
	$('input[name=set-medium]')[0].value = parseInt(timeSliderOptions.animationRate.medium);
	$('input[name=set-slow]')[0].value = parseInt(timeSliderOptions.animationRate.slow);

	$('#title-settings input, #title-settings textarea').on('keydown', function(event){
	  event.stopPropagation();
	});

}

function setDataset(dataset){
	dictionary[dataSetIndex] = {};
	dictionary[dataSetIndex]['original'] = $.extend(true, {}, dataset);
	var formState = {};
	$('#drop-down-list').append('<option value='+ dataSetIndex +'>'+ dataset.name +'</option>');

	var value = rgbToHex(parseInt(dataset.rgba[0]*256), parseInt(dataset.rgba[1]*256), parseInt(dataset.rgba[1]*256));
	$('input[name=set-color]')[0].value = value;
	formState['color'] = {'toggle' : false, 'value' : value};


	$('input[name=set-size]')[0].value = dataset.pointSize;
	setVal('size-val', dataset.pointSize);
	formState['size'] = {'toggle' : false, 'value' : dataset.pointSize};

	//CHANGE THIS TO ACTUAL VALUE
	$('input[name=set-span]')[0].value = (dataset.duration) ? convertDurationToPercent(dataset.duration) : 100;
	setVal('span-val', dataset.duration || 100);
	formState['span'] = {'toggle' : false, 'value' : (dataset.duration) ? convertDurationToPercent(dataset.duration) : 100}
	//

	$('input[name=set-hardness]')[0].value = dataset.hardness;
	setVal('hardness-val', dataset.hardness);
	formState['hardness'] = {'toggle' : false, 'value' : dataset.hardness};

	formState['blend'] = {'toggle' : false, 'value' : 'additive'};

	dictionary[dataSetIndex]['formState'] = formState;

	dataSetIndex++;
	$('input').prop('disabled','');
	$('textarea').prop('disabled','');
}

function switchDataset(index){
	loadFormState(dictionary[index]['formState']);
}

function updateAttributes(input){
	var attributeName = input.name.split('-')[1];
	var value = input.value;
	var currentIndex = getCurrentIndex();
	dictionary[currentIndex]['formState'][attributeName].toggle = true;
	dictionary[currentIndex]['formState'][attributeName].value = value;

	switch(attributeName){
		case 'color':
			attributeName = 'rgba';
			value = hexToRgba(value, 1);
			break;
		case 'size':
			attributeName = 'pointSize';
			value = parseFloat(value);
			break;
		case 'span':
			attributeName = 'duration';
			value = convertPercentToDuration(value);
			break;
		case 'hardness':
			attributeName = 'hardness';
			value = parseFloat(value);
			break;
		case 'blend':
			setBlendFunc($('input[name=set-blend]:checked').val(), gl);
			return;
			break;
		default:
			console.log('cannot identify: ' + attributeName);
			return;
	}

	setData(currentIndex, attributeName, value);
}

function toggleAttribute(input){
	var attributeName = input.name.split('-')[1];
	var value = $('input[name=set-'+ attributeName +']')[0].value;
	var currentIndex = getCurrentIndex();
	dictionary[currentIndex]['formState'][attributeName].toggle = input.checked;
	if(input.checked){
		switch(attributeName){
			case 'color':
				attributeName = 'rgba';
				value = hexToRgba(value, 1);
				break;
			case 'size':
				attributeName = 'pointSize';
				value = parseFloat(value);
				break;
			case 'span':
				attributeName = 'duration';
				value = convertPercentToDuration(value);
				break;
			case 'hardness':
				attributeName = 'hardness';
				value = parseFloat(value);
				break;
			case 'blend':
				setBlendFunc($('input[name=set-blend]:checked').val(), gl);
				return;
				break;
			default:
				console.log('cannot identify: ' + attributeName);
				return;
		}
	}else{
		originalDataset = dictionary[currentIndex]['original'];
		switch(attributeName){
			case 'color':
				attributeName = 'rgba';
				break;
			case 'size':
				attributeName = 'pointSize';
				break;
			case 'span':
				attributeName = 'duration';
				break;
			case 'hardness':
				attributeName = 'hardness';
				break;
			case 'blend':
				setBlendFunc('additive', gl);
				return;
				break;
			default:
				console.log('cannot identify: ' + attributeName);
				return;
		}

		value = originalDataset[attributeName];
		console.log(value);
	}
	setData(currentIndex, attributeName, value);
}

function getCurrentIndex(){
	return parseInt($('#drop-down-list')[0].value); 
}

function setData(index, attribute, value){
	datasets[index][attribute] = value;
}

function setMap(){
	mapOptions.zoom = map.zoom;
	mapOptions.center = map.center;
}

function convertPercentToDuration(percent){
	return (parseInt(percent)/100.0)*(timeSliderOptions.endTime - timeSliderOptions.startTime);
}

function convertDurationToPercent(duration){
	return parseInt(duration/(timeSliderOptions.endTime - timeSliderOptions.startTime) * 100);
}

function setChecked(id_str, isChecked){
	document.getElementById(id_str).checked = isChecked || true;
}

function setVal(id_str, value){
	document.getElementById(id_str).value = value;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgba(hex,a) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
    	parseInt(result[1], 16)/256.0,
        parseInt(result[2], 16)/256.0,
        parseInt(result[3], 16)/256.0,
        a
        ];
}

function setBlendFunc(blendstr, webgl){
	switch(blendstr){
		case 'additive':
			webgl.blendFunc( gl.SRC_ALPHA, gl.ONE );
			break;
		case 'solid':
			webgl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
			break;
		case 'default':

	}
}

function setTimeline(speed, value){
	switch(speed){
		case 'fast':
			timeSliderOptions.animationRate.fast = value;
			break;
		case 'medium':
			timeSliderOptions.animationRate.medium = value;
			break;
		case 'slow':
			timeSliderOptions.animationRate.slow = value;
			break;
	}
    if(timeSliderTimer){
    	clearTimeout(timeSliderTimer);
    }
    timeSliderTimer = setTimeout(reinitializeTimeSlider, 150);
}

function reinitializeTimeSlider(){
	timeSlider = new TimeSlider(timeSliderOptions);
}

function loadFormState(formState){
	for(var key in formState){
		$('input[name=toggle-'+ key + ']')[0].checked = formState[key].toggle;
		if(key != 'blend'){
			$('input[name=set-'+ key + ']')[0].value = formState[key].value;
		}else{
			var input = $('input[name=set-'+ key + '][value='+ formState[key].value + ']')[0];
			input.checked = true;
			setBlendFunc(input.value, gl);

		}
		
	}
}

function preview(){
	$(".tool-window").toggleClass("hidden"); 
	$("#preview-button").toggleClass("preview").toggleClass("show-tools");
	map.setZoom(mapOptions.zoom);
	map.setCenter(mapOptions.center);
}

function submit(){

}

$(initializeCustomization);