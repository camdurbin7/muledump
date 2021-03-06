var options = {
	totals: true,
	guid: true,
	chdesc: true,
	equipment: true,
	inv: true,
	vaults: true,
	famefilter: false,
	fameamount: '0',
	stats: false,
	sttype: 'base',
	pcstats: false,
}

var options_layout = {
	'totals': 'totals',
	'guid': 'emails',
	'chdesc': 'char description',
	'equipment': 'equipment',
	'inv': 'inventory',
	'vaults': 'vaults',
	'stats': {
		'label': 'stats',
		'radio': ['sttype', {
			'base': 'base',
			'avg': 'distance from average',
			'max': 'left to max',
		}]
	},
	'pcstats': 'additional stats',
	'famefilter': {
		'label': 'famebonus filter',
		'radio': ['fameamount', {
			'0': '> 0',
			'1': '> 1%',
			'2': '> 2%',
			'3': '> 3%',
			'4': '> 4%',
			'5': '> 5%',
		}]
	},
}

function gen_option(o) {
	var opt = options_layout[o];
	var $o = $('<div>');
	var radio = typeof opt == 'object';
	// checkbox
	var $inp = $('<input>').attr({
		type: 'checkbox',
		name: o,
		value: o,
		id: 'check_' + o,
	});
	if (options[o]) $inp.attr('checked', 'checked');
	// label for checkbox
	var ltext = radio ? opt.label : opt;
	var $lab = $('<label>').attr('for', 'check_' + o).text(ltext);
	
	$inp.change(function() {
		var name = $(this).attr('name');
		options[name] = $(this).is(':checked');
		option_updated(name);
	});
	// tree-style toggle
	if (radio) {
		$inp.change(function(e) {
			$('#radio_' + o).toggle($(this).is(':checked'));
		});
	}
	$inp.appendTo($o);
	$lab.appendTo($o);
	if (!radio) return $o;
	// radio
	var r = opt.radio;
	var rname = r[0], ritems = r[1];
	// radio container
	var $rc = $('<div class="radio">').attr('id', 'radio_' + o);
	for (var i in ritems) {
		var $inp = $('<input>').attr({
			type: 'radio',
			name: rname,
			value: i,
			id: 'radio_' + o + i,
		});
		if (options[rname] == i) $inp.attr('checked', 'checked');
		var $lab = $('<label>').attr('for', 'radio_' + o + i).text(ritems[i]);
		
		$inp.change(function() {
			var $this = $(this), name = $this.attr('name');
			options[name] = $this.is(':checked') ? $this.val() : false;
			option_updated(name);
		});
		
		$('<div>').append($inp).append($lab).appendTo($rc);
	}
	$rc.toggle(!!options[o]).appendTo($o);
	return $o;
}

// update single mule with all applicable options
function apply_options($targ) {
	var opts = 'guid stats sttype equipment inv pcstats chdesc vaults'.split(' ');
	for (var i = 0; i < opts.length; i++) option_updated(opts[i], $targ);
}

// update target or everything with single option
function option_updated(o, $ot) {
	var $targ = $ot || $('.mule');
	if (o == 'totals') {
		$totals.toggle(!!options.totals);
	} else if (o == 'famefilter' || o == 'fameamount') {
		update_totals();
	} else if (o == 'sttype') {
		$targ.find('.stat').each(function(){
			$(this).toggle($(this).hasClass(options.sttype));
		});
	} else {
		if (o) $targ.find('.' + o).toggle(!!options[o]);
	}
	if (!$ot && (o == 'equipment' || o == 'inv' || o == 'vaults')) {
		update_totals();
		update_filter();
	}
	var chparts = 'chdesc equipment inv stats pcstats'.split(' ');
	var ch_on = false, apply = false;
	for (var i = 0; i < chparts.length; i++) {
		apply = apply || o == chparts[i];
		ch_on = ch_on || options[chparts[i]];
	}
	if (apply) $targ.find('.chars').toggle(ch_on);
	if ($ot) return;
	// save
	try {
		localStorage['muledump:options'] = JSON.stringify(options);
	} catch (e) {}
	relayout();
}


$(function() {
	$totals = $('#totals');
	$errors = $('#errors');
	$stage = $('#stage');
	// read options from cache
	var c = '';
	try {
		c = localStorage['muledump:options'];
	} catch (e) {
		localStorage.clear();
	}
	if (c) {
		try {
			c = JSON.parse(c);
			for (var k in c) {
				if (k in options) options[k] = c[k];
			}
		} catch (e) {}
	}
	
	var $options = $('#options');
	for (var i in options_layout) {
		gen_option(i).appendTo($options);
	}
});

