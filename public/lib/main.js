$('document').ready(function() {
	"use strict";
	/*global socket app ajaxify*/

	function badgifyTitle(title, badge) {
		if (title.match(/^\[.+\]/)) {
			title = title.replace(/^\[.+\]/, '[' + badge + ']');
		} else {
			title = '[' + badge + '] ' + title;
		}

		return title;
	}

	function addSolvedTool() {
		$('.thread-tools .mark-solved').on('click', function(ev) {
			socket.emit('plugins.topicbadges.set', {
				text: 'Solved',
				tid: ajaxify.data['tid']
			}, function(err) {
				if (err) {
					app.alertError('Unable to mark <b>' + ajaxify.data['title'] +
												 '</b> as <i>solved</i>.');
					console.warn('[plugin/topic-badges] Setting \'solved\' badge ' +
											 'failed.');
					return console.error(err);
				}
				app.alertSuccess('<b>' + ajaxify.data['title'] +
												 '</b> is marked as <i>solved</i> now.');
				ajaxify.refresh();
			});

			ev.preventDefault();
			return false;
		});
	}

	$(window).on('action:ajaxify.end', function(ev, data) {

		if (data.url.match(/^topic\//)) {
			addSolvedTool();
		}
	});
});