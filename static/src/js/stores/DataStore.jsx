import {EventEmitter} from 'events';
import settingsStore from './SettingsStore'

const BACKEND_URL='https://beerfeed-ml9951.rhcloud.com'

class DataStore extends EventEmitter{

	fetchData = () => {
		$.get(`${BACKEND_URL}/Feed?user=${this.currentFeed}&lastID=${this.lastID}`).then(
			(data) => {
				if(data.checkins){
					this.lastID = data.lastID
					this.data = data.checkins.concat(this.data);
					this.emit('new-data')
				}
			}
		)
	}

	getFeedData(){
		return this.data;
	}

	constructor(){
		super();
		settingsStore.on('change', () => {
			this.currentFeed = settingsStore.getCurrentFeed();
			$.get(`${BACKEND_URL}/Feed?user=${this.currentFeed}`).then(
				(data) => {
					this.lastID = data.lastID
					this.data = data.checkins
					this.emit('new-data')
				}
			)
		})
		this.lastID = 0
		this.data = []
		this.currentFeed = settingsStore.getCurrentFeed()
		settingsStore.on('change', () => {
			this.currentFeed = settingsStore.getCurrentFeed();
			this.fetchData()
		});
		this.fetchData()
		setInterval(this.fetchData, 5000);
	}
}


export default new DataStore();