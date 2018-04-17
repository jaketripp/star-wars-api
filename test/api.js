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
          expect(data.name).to.not.equal("Star Wars");
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
          expect(people).to.be.an('array').that.does.not.include('C-3POzzz');
        });
    });
  });

  describe("planets", function () {
    it('should be able to fetch planet #1', function () {
      axios
        .get(`${baseUrl}/planets/1`)
        .then(({ data }) => {
          expect(data.name).to.be.equal("Tatooine");
          expect(data.name).to.not.equal("Star Wars");
        });
    });

    it('should be able to fetch the first 10 planets', function () {
      axios
        .get(`${baseUrl}/planets`)
        .then(({ data }) => {
          var planets = data.results.map((planet) => {
            return planet.name;
          });
          expect(planets).to.be.an('array').that.includes("Hoth");
          expect(planets).to.be.an('array').that.does.not.include("Hoath");
        });
    });
  })
});