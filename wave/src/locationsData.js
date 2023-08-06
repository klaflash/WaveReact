//RULES
//1. start[x] -> end[x] -> eventName[x] -> price[x] -> buyLink[x]
//2. Events must be entered in chronological order (start[0] is before start[1]...)
//3. If an event is edited its row must be deleted from the Events database
//4. name and eventName combined must be unique
//5. Must put 0's before single digit dates

const locations = [
    {
        "name": "Nova",
        "latitude": 40.415171,
        "longitude": -86.893275,
        "addy": "200 S Fourth St, IN",
        "event": false,
        "start": null,
        "end": null,
        "date": null,
        "eventName": null,
        "price": null
    },
    {
        "name": "Hub",
        "latitude": 40.422203,
        "longitude": -86.906227,
        "addy": "111 S Salisbury St, IN",
        "event": true,
        "start": ["2023-08-02T22:00-04:00"],
        "end": ["2023-08-03T03:00-04:00"],
        "eventName": ["DJ whatever"],
        "price": ["20"]
    },
    {
        "name": "Rise",
        "latitude": 40.422677,
        "longitude": -86.906967,
        "addy": "134 W State St, IN",
        "event": true,
        "start": ["2023-08-02T22:00-04:00"],
        "end": ["2023-08-02T23:00-04:00"],
        "eventName": ["Celebrity boxing"],
        "price": ["10"]
    },
    {
        "name": "Test",
        "latitude": 42.111683,
        "longitude": -71.872295,
        "addy": "123 Random St",
        "event": true,
        "start": ["2023-08-06T20:00-04:00", "2023-08-07T22:00-04:00"],
        "end": ["2023-08-06T22:00-04:00", "2023-08-07T01:00-04:00"],
        "eventName": ["Basketball vs IU", 'Fireworks'],
        "price": ["2", 'Free'],
        "buyLink": ["https://seatgeek.com/indiana-hoosiers-at-purdue-boilermakers-football-tickets/ncaa-football/2023-11-25-3-30-am/5853585", 'https://www.google.com'],
        "description": ['Watch Zach Edey and Purdue take on rivals IU', 'What a great way to celebrate the summer']
    },
    {
        "name": "Test2",
        "latitude": 42.299103,
        "longitude": -71.78502,
        "addy": "123 Whatever Ave",
        "event": true,
        "start": ["2023-08-05T21:00-04:00"],
        "end": ["2023-08-05T24:00-04:00"],
        "eventName": ["Football vs Nebraska"],
        "price": ["Free"]
    },
    {
        "name": "Seattle",
        "latitude": 47.60748,
        "longitude": -122.336241,
        "addy": "123 Whatever Ave, WA",
        "event": true,
        "start": ["2023-07-13T21:00-04:00"],
        "end": ["2023-07-13T23:00-04:00"],
        "eventName": ["Football vs Nebraska"],
        "price": ["Free"]
    },
    {
        "name": "Harry's",
        "latitude": 40.423800,
        "longitude": -86.909066,
        "addy": "329 W State St, IN",
        "event": false,
        "start": null,
        "end": null,
        "eventName": null,
        "price": null,
        "buyLink": null,
        "description": null
    },
    {
        "name": "Brothers Bar",
        "latitude": 40.424062,
        "longitude": -86.908384,
        "addy": "306 W State St, IN",
        "event": false,
        "start": null,
        "end": null,
        "eventName": null,
        "price": null,
        "buyLink": null,
        "description": null
    },
    {
        "name": "Where Else",
        "latitude": 40.422910,
        "longitude": -86.908019,
        "addy": "135 S Chauncey Ave, IN",
        "event": false,
        "start": null,
        "end": null,
        "eventName": null,
        "price": null,
        "buyLink": null,
        "description": null
    },
    {
        "name": "Twammers",
        "latitude": 40.424351,
        "longitude": -86.908920,
        "addy": "308 W State St, IN",
        "event": false,
        "start": null,
        "end": null,
        "eventName": null,
        "price": null,
        "buyLink": null,
        "description": null
    },
    {
        "name": "Neon Cactus",
        "latitude": 40.423453,
        "longitude": -86.900469,
        "addy": "360 Brown St, IN",
        "event": false,
        "start": null,
        "end": null,
        "eventName": null,
        "price": null,
        "buyLink": null,
        "description": null
    },
    {
        "name": "Blind Pig",
        "latitude": 40.420190,
        "longitude": -86.894116,
        "addy": "302 Ferry St, IN",
        "event": false,
        "start": null,
        "end": null,
        "eventName": null,
        "price": null,
        "buyLink": null,
        "description": null
    },
    {
        "name": "Vault",
        "latitude": 40.419790,
        "longitude": -86.895319,
        "addy": "205 N 2nd St, IN",
        "event": false,
        "start": null,
        "end": null,
        "eventName": null,
        "price": null,
        "buyLink": null,
        "description": null
    },
    {
        "name": "WPB",
        "latitude": 26.714334,
        "longitude": -80.055297,
        "addy": "Random Name St",
        "event": true,
        "start": ["2023-08-08T22:00-04:00"],
        "end": ["2023-08-08T22:00-04:00"],
        "eventName": ['Surfing By the Sea'],
        "price": ['Free'],
        "buyLink": null,
        "description": null
    }

]


  export default locations;