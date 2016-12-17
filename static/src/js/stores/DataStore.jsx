import {EventEmitter} from 'events';
import settingsStore from 'beerfeed/stores/SettingsStore'
import update from 'react/lib/update';
import $ from 'jquery'
import {BACKEND_URL} from 'beerfeed/Constants'

class DataStore extends EventEmitter{

	fetchData = () => {
		$.get(`${BACKEND_URL}/Feed?user=${this.currentFeed}&lastID=${this.lastID}`).then(
			(data) => {
				if(data.checkins){
					this.lastID = data.lastID
					this.data = data.checkins.concat(this.data);

					for(var i = 0; i < data.checkins.length; i++){
						if(this.mapData[data.checkins[i].venue_id]){
							this.mapData[data.checkins[i].venue_id].push(data.checkins[i]);
						}else{
							this.mapData[data.checkins[i].venue_id] = [data.checkins[i]]
						}
					}

					this.emit('new-data')
				}
			}
		)
	}

	getFeedData(){
		return this.data;
	}

	getMapData(){
		return this.mapData;
	}

	constructor(){
		super();
		settingsStore.on('change', () => {
			this.lastID = 0;
			this.data = []
			this.currentFeed = settingsStore.getCurrentFeed()
			this.fetchData()
		})
		this.lastID = 0
		this.data = []
		this.mapData = {};
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