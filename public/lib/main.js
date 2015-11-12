$('document').ready(function() {
	"use strict";
	/*global socket app ajaxify*/

	function addSolvedTool() {
		$('.thread-tools .mark-solved').on('click', function(ev) {
			socket.emit('plugins.TopicBadges.set', {
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

	function addBadge() {
		var badgeText = ajaxify.data.badge;
		var buttonClass = '';
		var deleteButton = '';

		require(['components'], function(components) {
			var titleComponent = components.get('topic/title');
			if (void 0 !== badgeText && badgeText !== '') {
				if (canEdit()) {
					buttonClass = 'topic-badge-edit';
					deleteButton = '<i class="fa fa-times topic-badge-del"></i>';
				}
				titleComponent.after('<div class="badge topic-badge ' +
																buttonClass + '">' +
																badgeText + deleteButton + '</div>');
				addBadgeHandler(titleComponent);
			} else {
				if (canEdit()) {
					titleComponent.after('<div class="badge topic-badge topic-badge-add">Add Badge</div>');
					addBadgeHandler(titleComponent);
				}
			}
		});
	};

	function deleteBadge(evt) {
		console.log('[plugin/topic-badges] Deleting Badge');
		socket.emit('plugins.TopicBadges.rm', {
			tid: ajaxify.data.tid
		}, function(err) {
			if (err) {
				app.alertError('Couldn\'t delete badge.');
				console.warn('[plugin/topic-badges] Deleting badge failed.');
				return console.error(err);
			}
			app.alertSuccess('Badge has been deleted.');
			ajaxify.refresh();
		});
		if (evt) {
			evt.stopPropagation();
		}
	}

	function canEdit() {
		return (ajaxify.data.uid === app.user.uid || app.user.isAdmin);
	}

	function addBadgeHandler(titleComponent) {
		var badgeButton = titleComponent.siblings('.topic-badge');
		var deleteButton = badgeButton.children('.topic-badge-del');
		if (badgeButton.length > 0 && canEdit()) {
			badgeButton.on('click', badgeDialog);
			if (deleteButton.length > 0) {
				deleteButton.on('click', deleteBadge);
			}
		}
	}

	function badgeDialog() {
		var current = ajaxify.data.badge;
		window.bootbox.prompt({
			title: ((current) ? 'Edit' : 'Add') + ' Badge',
			value: (current) ? current : '',
			callback: function(result) {
				if (result === null) {
					console.log('[plugin/topic-badges] Dialog was canceled.');
				} else {
					if (current && result === current) {
						return console.info('[plugin/topic-badges] Dialog confirmed, ' +
																'but value wasn\'t changed. Doing nothing...');
					}
					console.info('[plugin/topic-badges] New badge value: ' + result);
					if (result === '') {
						console.info('[plugin/topic-badges] Dialog confirmed, ' +
												 'but value is empty. Deleting badge...');
						return deleteBadge();
					}
					socket.emit('plugins.TopicBadges.set', {
							text: result,
							tid: ajaxify.data.tid
						}, function(err) {
							if (err) {
								app.alertError('Couldn\'t change badge.');
								console.warn('[plugin/topic-badges] Setting badge failed.');
								return console.error(err);
							}
							app.alertSuccess('Badge has been changed to <b>' + result + '</b>.');
							ajaxify.refresh();
						});
				}
			}
		});
	}

	$(window).on('action:ajaxify.end', function(ev, data) {
		if (data.url.match(/^topic\//)) {
			addSolvedTool();
		}
	});
	$(window).on('action:topic.loaded', addBadge);
});
