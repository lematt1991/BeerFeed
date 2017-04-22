import Store from './Store';
import * as SettingsActions from './actions/SettingsActions';
import * as DataActions from './actions/DataActions';

Store.dispatch(SettingsActions.fetchFeeds)

const {currentFeed} = Store.getState().settings
Store.dispatch(DataActions.fetchData(currentFeed))
setInterval(() => {
	const currentFeed = Store.getState().settings.currentFeed;
	const lastID = Store.getState().data.lastID;
	Store.dispatch(DataActions.updateData(currentFeed, lastID))
}, 5000)
