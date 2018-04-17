const express = require('express');
const axios = require('axios');

const port = process.env.PORT || 3000;
let app = express();

// specific person
app.get('/people/:id', (req, res) => {
  const { id } = req.params;
  axios
    .get(`https://swapi.co/api/people/${id}`)
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      console.log(error);
      res.send('ERROR: Unable to fetch data.');
    });
});

// all people
// sort by ['name', 'mass', 'height']
app.get('/people', (req, res) => {
  let { sort, sortReverse } = req.query;
  axios
    .get(`https://swapi.co/api/people`)
    .then(({ data }) => {
      res.send(sortByProperty(data, sort));
    })
    .catch(error => {
      console.log(error);
      res.send('ERROR: Unable to fetch data.');
    });
});


// specific planet
app.get('/planets/:id', (req, res) => {
  const { id } = req.params;
  axios
    .get(`https://swapi.co/api/planets/${id}`)
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      console.log(error);
      res.send('ERROR: Unable to fetch data.');
    });
});

// specific planet residents (optional endpoint)
app.get('/planets/:id/residents', (req, res) => {
  const { id } = req.params;

  // get all data
  axios
    .get(`https://swapi.co/api/planets/${id}`)
    .then(({ data }) => {

      let modifiedData = data;
      let promises = [];

      // loop through residents and populate promises array
      for (let i = 0; i < data.residents.length; i++) {

        let residentURL = data.residents[i];
        promises.push(axios.get(residentURL));

      }

      axios.all(promises).then(axios.spread(function () {
        // All requests are now complete

        // convert arguments to an actual array
        const args = Array.from(arguments);

        let residentNames = args.map((resident) => {
          return resident.data.name;
        });

        modifiedData.residents = residentNames;
        res.send(modifiedData);
      }));

    })
    .catch(error => {
      console.log(error);
      res.send('ERROR: Unable to fetch data.');
    });
});

// all planets
app.get('/planets', (req, res) => {
  let { sort, sortReverse } = req.query;
  axios
    .get(`https://swapi.co/api/planets`)
    .then(({ data }) => {
      res.send(sortByProperty(data, sort));
    })
    .catch(error => {
      console.log(error);
      res.send('ERROR: Unable to fetch data.');
    });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});



// gets passed 
  // response.data
  // property by which to sort
// returns response.data with response.data.results sorted correctly
// handle sortReverse here
function sortByProperty(data, property) {
  data.results = data.results.sort(byProperty(property));
  return data;
}

// helper function to sort by property
function byProperty(property) {
  return function (a, b) {

    // name
    if (isNaN(Number(a[property]))) {
      if (a[property] < b[property]) {
        return -1;
      } else if (a[property] > b[property]) {
        return 1;
      } else {
        return 0;
      }

    // height, mass => needs to be converted to a Number
    } else {
      if (Number(a[property]) < Number(b[property])) {
        return -1;
      } else if (Number(a[property]) > Number(b[property])) {
        return 1;
      } else {
        return 0;
      }
    }

  }
}