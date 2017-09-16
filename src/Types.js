

type Feed = {
	coordinates : Array<number>,
	name : string,
	topRating : number
}

export type Feeds = {
	rochester_feed : Feed,
	nyc_feed : Feed,
	worker1234 : Feed,
	lexxx320 : Feed,
	lematt1991 : Feed
}

export type FeedName = $Keys<Feeds>
