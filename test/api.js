const axios = require('axios');
const expect = require('chai').expect;

let baseUrl = "http://localhost:3000"

describe("api endpoints", function () {
  describe("people", function () {

    it('should be able to fetch person #1', function () {
      axios
        .get(`${baseUrl}/people/1`)
        .then(({ data }) => {
          expect(data.name).to.be.equal("Luke Skywalker");
        })
        .catch(error => {
          throw new Error('ERROR: Unable to fetch data.');
        });
    });
    it('should be able to fetch the first 10 people', function () {
      axios
        .get(`${baseUrl}/people`)
        .then(({ data }) => {
          var people = data.results.map((person) => {
            return person.name;
          });
          expect(people).to.be.an('array').that.includes('C-3PO');
        })
        .catch(error => {
          throw new Error('ERROR: Unable to fetch data.');
        });
    });
  });
});