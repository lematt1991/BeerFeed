The Beer Feed
-------------
[![Build Status](https://travis-ci.org/ml9951/BeerFeed.svg?branch=master)](https://travis-ci.org/ml9951/BeerFeed) [![codecov](https://codecov.io/gh/ml9951/BeerFeed/branch/master/graph/badge.svg)](https://codecov.io/gh/ml9951/BeerFeed)
[![Dependency Status](https://gemnasium.com/badges/github.com/ml9951/BeerFeed.svg)](https://gemnasium.com/github.com/ml9951/BeerFeed)


The Beer Feed is a simple React application powered by [Untappd](https://untappd.com) to provide users with a list of only the *good* beers that get checked in.  It continuously queries the Untappd feed, via the [Untappd API](https://untappd.com/api/docs), for a given location and filters out any checkins that have an aggregate score below a given threshold (currently 4.0).

The live version can be found [here](http://www.thebeerfeed.com)

## Screen Shots

#### List View
![](http://imgur.com/GKgyeUV.png)

#### Map View

![](http://i.imgur.com/XvFKUXH.png)

#### Map View With Popup
![](http://i.imgur.com/oQwlkEw.png)