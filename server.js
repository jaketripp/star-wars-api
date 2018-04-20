const express = require("express");
const axios = require("axios");

const port = process.env.PORT || 3000;
let app = express();
let dnscache = require("dns-cache")(10000);

// =========
// ENDPOINTS
// =========

// specific person
app.get("/people/:id", (req, res) => {
  const { id } = req.params;
  axios
    .get(`https://swapi.co/api/people/${id}`)
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      console.log(error);
      res.send("ERROR: Unable to fetch data.");
    });
});

// all people
app.get("/people", (req, res) => {
  let { sort, isReversed } = getSortInfo(req.query);

  axios
    .get(`https://swapi.co/api/people`)
    .then(({ data }) => {
      getData("https://swapi.co/api/people", []).then(people => {
        let sortedPeople = sortByProperty(people, sort, isReversed);
        res.send(sortedPeople);
      });
    })
    .catch(error => {
      console.log(error);
      res.send("ERROR: Unable to fetch data.");
    });
});

// specific planet
app.get("/planets/:id", (req, res) => {
  const { id } = req.params;
  axios
    .get(`https://swapi.co/api/planets/${id}`)
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      console.log(error);
      res.send("ERROR: Unable to fetch data.");
    });
});

// specific planet with resident names (optional endpoint)
app.get("/planets/:id/residents", (req, res) => {
  const { id } = req.params;
  axios
    .get(`https://swapi.co/api/planets/${id}`)
    .then(({ data: planet }) => {
      let promises = planet.residents.map(residentURL => {
        return axios.get(residentURL);
      });

      Promise.all(promises).then(response => {
        planet.residents = response.map(residentObj => {
          return residentObj.data.name;
        });
        res.send(planet);
      });
    })
    .catch(error => {
      console.log(error);
      res.send("ERROR: Unable to fetch data.");
    });
});

// all planets
app.get("/planets", (req, res) => {
  let { sort, isReversed } = getSortInfo(req.query);

  getData("https://swapi.co/api/planets", []).then(planets => {
    let nestedResidentsArrayPromise = getNestedResidentsArray(planets);

    nestedResidentsArrayPromise
      .then(nestedResidentsArray => {
        let planetDataWithResidentNames = replaceResidentURLsWithNames(
          planets,
          nestedResidentsArray
        );

        let sortedPlanetsWithResidentNames = sortByProperty(
          planetDataWithResidentNames,
          sort,
          isReversed
        );

        res.send(sortedPlanetsWithResidentNames);
      })
      .catch(e => {
        console.log(e);
      });
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

// =========
// FUNCTIONS
// =========

/* 
  gets passed
    response.data (object)
    property by which to sort (string)
    isReversed (boolean)
  returns 
    response.data with response.data.results sorted correctly 
*/

function sortByProperty(data, property, isReversed) {
  if (isReversed) {
    data.results = data.results.sort(byProperty(property)).reverse();
  } else {
    data.results = data.results.sort(byProperty(property));
  }
  return data;
}

// helper function to sort by property
function byProperty(property) {
  return function(a, b) {
    // weird exception JUST FOR Jabba the Hutt's mass, which is a stringified number WITH A COMMA
    // arguably an error with SWAPI 
      // - no other stringified number has a comma in it (planet mass, diameter, population, or orbital_period)
    if (property === 'mass') {
      if (a[property].includes(',')) {
        a[property] = a[property].replace(',', '');
        console.log(a['name']);
        console.log(a[property]);
      }
      if (b[property].includes(',')) {
        b[property] = b[property].replace(",", "");
        console.log(b['name']);
        console.log(b[property]);
      }
    }

    // name
    if (isNaN(Number(a[property])) || isNaN(Number(b[property]))) {
      if (a[property] < b[property]) {
        return -1;
      } else if (a[property] > b[property]) {
        return 1;
      } else {
        return 0;
      }

      // height, mass, population, diameter => need to be converted from string to a Number
    } else {
      if (Number(a[property]) < Number(b[property])) {
        return -1;
      } else if (Number(a[property]) > Number(b[property])) {
        return 1;
      } else {
        return 0;
      }
    }
  };
}

// recursively get data using data.next as the next URL
function getData(nextURL, recursionArray) {
  return axios
    .get(nextURL)
    .then(({ data }) => {
      recursionArray = recursionArray.concat(data.results);
      if (data.next) {
        return getData(data.next, recursionArray);
      }

      return { count: data.count, results: recursionArray };
    })
    .catch(error => {
      console.log(error);
      res.send("ERROR: Unable to fetch data.");
    });
}

function replaceResidentURLsWithNames(planetsData, allPlanetResidents) {
  allPlanetResidents.forEach((planetResidents, i) => {
    planetsData.results[i].residents = planetResidents;
  });
  return planetsData;
}

function getNestedResidentsArray(planets) {
  return Promise.all(
    planets.results.map(function(planet, i) {
      return Promise.all(
        planet.residents.map(function(residentURL) {
          return axios.get(residentURL);
        })
      ).then(planetResidents => {
        return planetResidents.map(resident => {
          return resident.data.name;
        });
      });
    })
  );
}

function getSortInfo({ sort, reverseOrder }) {
  let isReversed;
  if (reverseOrder) {
    isReversed = reverseOrder.toLowerCase() === "true" ? true : false;
  }
  return { sort, isReversed };
}
