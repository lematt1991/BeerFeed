import Store from './Store'
import * as SettingsActions from './actions/SettingsActions'

Store.dispatch(SettingsActions.fetchFeeds)
