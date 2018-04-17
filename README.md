Star Wars REST API 
=======
(powered by https://swapi.co/)

---

## Installation

 * ```node server.js``` to start the server
 * ```npm test``` to run the test suite

---

## Endpoints
 
### /people/:id
An endpoint that returns all data about 1 person.

### /people
An endpoint that returns data about ALL people in the API.
 * Can be sorted by name, mass, or height by using URL queries (i.e. ```/?sort=name```). 
 * Can reverse the order by using ```/?reverseOrder=true```.

### /people/:id
An endpoint that returns all data about 1 planet.

### /planets
An endpoint that returns data about ALL planets in the API.
 * Can be sorted by name, population, or diameter by using URL queries (i.e. ```/?sort=name```).
 * Can reverse the order by using ```/?reverseOrder=true```.

### /people/:id/residents
An endpoint that returns all data about 1 planet, with a list of resident names stored inside ```residents``` instead of their respective API URLs.

---

All endpoints return JSON.

*[powered by Star Wars API](https://swapi.co/)*