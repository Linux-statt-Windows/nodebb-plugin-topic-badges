(function(module) {
	"use strict";

	var TopicBadges = {};

	var topics = module.parent.require('./topics.js'),
		privileges = module.parent.require('./privileges'),
		async = module.parent.require('async'),
		PluginSocket = module.parent.require('./socket.io/plugins'),
		validator = require('validator');

	TopicBadges.init = function(params, callback) {
		PluginSocket.TopicBadges = {
			set: function(socket, data, cb) {
				if (!data.text) {
					return cb('ERRNOTEXT');
				}
				if (!data.tid) {
					return cb('ERRNOTID');
				}
				privileges.topics.canEdit(data.tid, socket.uid, function(err, canEdit) {
					if (!canEdit || err) {
						return cb(new Error('[[error:no-privileges]]'));
					}

					TopicBadges.setBadge(data.tid, data.text, cb);
				});
			},
			rm: function(socket, data, cb) {
				if (!data.tid) {
					return cb('ERRNOTID');
				}
				privileges.topics.canEdit(data.tid, socket.uid, function(err, canEdit) {
					if (!canEdit || err) {
						return cb(new Error('[[error:no-privileges]]'));
					}

					TopicBadges.setBadge(data.tid, cb);
				});
			}
		};
		callback();
	};

	TopicBadges.setBadge = function(tid, text, callback) {
		if (typeof text === 'function') {
			callback = text;
			text = '';
		}
		// escape text to prevent XSS
		text = validator.escape(text);
		topics.setTopicField(tid, 'badge', text, callback);
	};

	TopicBadges.addScripts = function(scripts, callback) {
		scripts.push('plugins/nodebb-plugin-topic-badges/lib/main.js');
		callback(null, scripts);
	};

	TopicBadges.addThreadTools = function(data, callback) {
		data.tools.push({
			"title": "Mark <strong>Solved</strong>",
			"class": "mark-solved",
			"icon": "fa-check"
		});

		callback(null, data);
	};

	module.exports = TopicBadges;
}(module));
