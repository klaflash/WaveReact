//RULES
//1. start[x] -> end[x] -> eventName[x] -> price[x] -> buyLink[x]
//2. Events must be entered in chronological order (start[0] is before start[1]...)
//3. If an event is edited its row must be deleted from the Events database
//4. name and eventName combined must be unique

const locations = [
    {
        "name": "Nova",
        "latitude": 40.415171,
        "longitude": -86.893275,
        "addy": "200 S Fourth St",
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
        "addy": "111 S Salisbury St",
        "event": true,
        "start": ["2023-07-09T22:00-04:00"],
        "end": ["2023-07-10T03:00-04:00"],
        "eventName": ["DJ whatever"],
        "price": ["20"]
    },
    {
        "name": "Rise",
        "latitude": 40.422677,
        "longitude": -86.906967,
        "addy": "134 W State St",
        "event": true,
        "start": ["2023-07-10T22:00-04:00"],
        "end": ["2023-07-10T23:00-04:00"],
        "eventName": ["Celebrity boxing"],
        "price": ["10"]
    },
    {
        "name": "Test",
        "latitude": 42.111683,
        "longitude": -71.872295,
        "addy": "123 Random St",
        "event": true,
        "start": ["2023-07-13T22:00-04:00", "2023-07-14T19:00-04:00"],
        "end": ["2023-07-14T01:00-04:00", "2023-07-14T22:00-04:00"],
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
        "start": ["2023-07-09T21:00-04:00"],
        "end": ["2023-07-09T24:00-04:00"],
        "eventName": ["Football vs Nebraska"],
        "price": ["Free"]
    },
    {
        "name": "Seattle",
        "latitude": 47.60748,
        "longitude": -122.336241,
        "addy": "123 Whatever Ave",
        "event": true,
        "start": ["2023-07-13T21:00-04:00"],
        "end": ["2023-07-13T23:00-04:00"],
        "eventName": ["Football vs Nebraska"],
        "price": ["Free"]
    }
]


  export default locations;