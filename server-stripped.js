const express = require("express");
const axios = require("axios");
const port = process.env.PORT || 3000;
let app = express();

app.get("/people/:id", (req, res) => {
  axios.get(`https://swapi.co/api/people/${req.params.id}`).then(response => {
    res.send(response.data);
  }).catch(error => {
    res.send("ERROR: Unable to fetch data.");
  });
});

app.get("/people", (req, res) => {
  let { sort, isReversed } = getSortInfo(req.query);
  axios.get(`https://swapi.co/api/people`).then(({ data }) => {
    getData("https://swapi.co/api/people", []).then(people => {
      res.send(sortByProperty(people, sort, isReversed));
    });
  }).catch(error => {
    res.send("ERROR: Unable to fetch data.");
  });
});

app.get("/planets/:id", (req, res) => {
  axios.get(`https://swapi.co/api/planets/${req.params.id}`).then(response => {
    res.send(response.data);
  }).catch(error => {
    res.send("ERROR: Unable to fetch data.");
  });
});

app.get("/planets/:id/residents", (req, res) => {
  const { id } = req.params;
  axios.get(`https://swapi.co/api/planets/${id}`).then(({ data: planet }) => {
    let promises = planet.residents.map(residentURL => {
      return axios.get(residentURL);
    });
    Promise.all(promises).then(response => {
      planet.residents = response.map(residentObj => {
        return residentObj.data.name;
      });
      res.send(planet);
    });
  }).catch(error => {
    res.send("ERROR: Unable to fetch data.");
  });
});

app.get("/planets", async (req, res) => {
  let { sort, isReversed } = getSortInfo(req.query);
  const planets = await getData("https://swapi.co/api/planets", []);
  const people = await getData("https://swapi.co/api/people", []);
  const planetResidentObj = {};

  people.results.forEach(person => {
    if (!planetResidentObj[person.homeworld]) {
      planetResidentObj[person.homeworld] = [];
    }
    planetResidentObj[person.homeworld].push(person.name);
  });

  planets.results.forEach(planet => {
    if (planetResidentObj[planet.url]) {
      planet.residents = planetResidentObj[planet.url];
    } else {
      planet.residents = [];
    }
  });
  res.send(sortByProperty(planets, sort, isReversed));
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

function sortByProperty(data, property, isReversed) {
  data.results = data.results.sort(byProperty(property));
  if (isReversed) {
    data.results = data.results.reverse();
  }
  return data;
}

function byProperty(property) {
  return function(a, b) {
    if (property === "mass") {
      a[property] = a[property].replace(",", "");
      b[property] = b[property].replace(",", "");
    }

    if (isNaN(Number(a[property])) || isNaN(Number(b[property]))) {
      if (a[property] < b[property]) {
        return -1;
      } else if (a[property] > b[property]) {
        return 1;
      } else {
        return 0;
      }
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

function getData(nextURL, recursionArray) {
  return axios.get(nextURL).then(({ data }) => {
    recursionArray = recursionArray.concat(data.results);
    if (data.next) {
      return getData(data.next, recursionArray);
    }
    return { count: data.count, results: recursionArray };
  }).catch(error => {
    res.send("ERROR: Unable to fetch data.");
  });
}

function getSortInfo({ sort, reverseOrder }) {
  let isReversed;
  if (reverseOrder) {
    isReversed = reverseOrder.toLowerCase() === "true" ? true : false;
  }
  return { sort, isReversed };
}