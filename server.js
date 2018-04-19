const express = require("express");
const axios = require("axios");

const port = process.env.PORT || 3000;
let app = express();

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
  let { sort, reverseOrder } = req.query;
  axios
    .get(`https://swapi.co/api/people`)
    .then(({ data }) => {
      let { sort, reverseOrder } = req.query;
      let isReversed;
      if (reverseOrder) {
        isReversed = reverseOrder.toLowerCase() === "true" ? true : false;
      }

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

// specific planet residents (optional endpoint)
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
// gnarly first take
app.get("/planets", (req, res) => {
  let { sort, reverseOrder } = req.query;
  let isReversed;
  if (reverseOrder) {
    isReversed = reverseOrder.toLowerCase() === "true" ? true : false;
  }

  getData("https://swapi.co/api/planets", []).then(planets => {
    let planetDataWithResidentNames = planets;
    let count = planets.results.length;
    let answer = new Promise((resolve, reject) => {
      for (let k = 0; k < planetDataWithResidentNames.results.length; k++) {
        let promises = [];

        // loop through residents and populate promises array
        for (
          let i = 0;
          i < planetDataWithResidentNames.results[k].residents.length;
          i++
        ) {
          let residentURL = planetDataWithResidentNames.results[k].residents[i];
          promises.push(axios.get(residentURL));
        }

        axios
          .all(promises)
          .then(
            axios.spread(function() {
              // All requests are now complete
              // convert arguments to an actual array
              const args = Array.from(arguments);

              let residentNames = args.map(resident => {
                return resident.data.name;
              });

              // console.log("=============================");
              // console.log(planets.results[k].name);
              // console.log(residentNames);
              // console.log("=============================");
              setTimeout(() => {
                count--;
                planetDataWithResidentNames.results[
                  k
                ].residents = residentNames;

                if (count === 0) {
                  resolve(planetDataWithResidentNames);
                }
              }, 1);
            })
          )
          .catch(e => {
            console.log(e);
          });
      }
    });

    answer
      .then(planets => {
        let sortedPlanets = sortByProperty(planets, sort, isReversed);
        res.send(sortedPlanets);
        // res.send(planets);
      })
      .catch(e => {
        console.log(e);
      });
  });
});

// all planets
// best approach
app.get("/planets2", (req, res) => {
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

// async/await implementation
app.get("/planets3", async (req, res) => {
  let { sort, isReversed } = getSortInfo(req.query);

  const planets = await getData("https://swapi.co/api/planets", []);

  const planetResults = planets.results.map(async (planet, index) => {
    const residentURLs = planet.residents.map(async residentURL => {
      return axios.get(residentURL);
    });

    return Promise.all(residentURLs)
      .then(planetResidents => {
        return planetResidents.map(resident => {
          return resident.data.name;
        });
      })
      .catch(e => {
        throw e;
      });
  });

  Promise.all(planetResults)
    .then(allPlanetResidents => {
      // allPlanetResidents is an array of arrays of residents
      let planetDataWithResidentNames = replaceResidentURLsWithNames(
        planets,
        allPlanetResidents
      );

      let sortedPlanetsWithResidentNames = sortByProperty(
        planetDataWithResidentNames,
        sort,
        isReversed
      );

      res.send(sortedPlanetsWithResidentNames);
    })
    .catch(e => {
      throw e;
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
    // name
    if (isNaN(Number(a[property]))) {
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
