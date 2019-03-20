import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Subscriptions } from '../../models';
import { settings } from '../../settings';
import { hasPermission } from '../../authorization';
import { MessageAction, modal } from '../../ui-utils';
import { t } from '../../utils';

const condition = (rid, uid) => {
	if (!Subscriptions.findOne({ rid })) {
		return false;
	}
	return uid !== Meteor.userId() ? hasPermission('start-thread-other-user') : hasPermission('start-thread');
};

Meteor.startup(function() {
	Tracker.autorun(() => {
		if (!settings.get('Thread_enabled')) {
			return MessageAction.removeButton('start-thread');
		}

		MessageAction.addButton({
			id: 'start-thread',
			icon: 'thread',
			label: 'Thread_start',
			context: ['message', 'message-mobile'],
			async action() {
				const [, message] = this._arguments;

				modal.open({
					title: t('Threading_title'),
					modifier: 'modal',
					content: 'CreateThread',
					data: { rid: message.rid, message, onCreate() {
						modal.close();
					} },
					confirmOnEnter: false,
					showConfirmButton: false,
					showCancelButton: false,
				});
			},
			condition({ rid, u: { _id: uid }, trid, tcount }) {
				if (trid || !isNaN(tcount)) {
					return false;
				}
				return condition(rid, uid);
			},
			order: 0,
			group: 'menu',
		});
	});
});
