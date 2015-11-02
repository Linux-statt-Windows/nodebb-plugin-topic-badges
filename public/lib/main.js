(function() {
"use strict";

	function badgifyTitle(title, badge) {
		if (title.match(/^\[.+\]/)) {
			title = title.replace(/^\[.+\]/, '[' + badge + ']');
		} else {
			title = '[' + badge + '] ' + title;
		}

		return title;
	}

	jQuery('document').ready(function() {
		$(window).on('action:ajaxify.end', function(ev, data) {

			if (data.url.match(/^topic/)) {
				$('.thread-tools .mark-solved').on('click', function(ev) {
					var title = badgifyTitle(ajaxify.variables.get('topic_name'), 'Solved');
					socket.emit('admin.topics.renameTopic', {
						tid: ajaxify.variables.get('topic_id'),
						title: title
					}, function(err) {
						if (!err) {
							$('.topic-title').html(title);
						}
					});

					ev.preventDefault();
					return false;
				});
			}
		});

	});
}());