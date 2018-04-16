const express = require('express');
const request = require('request');
const axios = require('axios');

const port = process.env.PORT || 3000;
let app = express();

// specific person
app.get('/people/:id', (req, res) => {
  const { id } = req.params;
  axios
    .get(`https://swapi.co/api/people/${id}`)
    .then(response => {
      res.send(JSON.stringify(response.data));
    })
    .catch(error => {
      console.log(error);
      res.send('ERROR: Unable to fetch data.');
    });
});

// all people
// req.query for sort queries
app.get('/people', (req, res) => {
  axios
    .get(`https://swapi.co/api/people`)
    .then(response => {
      res.send(JSON.stringify(response.data));
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
      res.send(JSON.stringify(response.data));
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
  axios
    .get(`https://swapi.co/api/planets`)
    .then(response => {
      res.send(JSON.stringify(response.data));
    })
    .catch(error => {
      console.log(error);
      res.send('ERROR: Unable to fetch data.');
    });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});