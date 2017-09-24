import Store from './Store';
import * as SettingsActions from './actions/SettingsActions';
import * as DataActions from './actions/DataActions';

// Fetch the available feeds from the server
Store.dispatch(SettingsActions.fetchFeeds)

// Perform initial data fetch.
const {currentFeed} = Store.getState().settings
Store.dispatch(DataActions.fetchData(currentFeed))