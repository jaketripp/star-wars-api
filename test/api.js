const axios = require('axios');
const expect = require('chai').expect;

let baseUrl = "http://localhost:3000"

describe("api endpoints", function () {
  describe("people", function () {

    it('should be able to fetch person #1', function () {
      return axios
        .get(`${baseUrl}/people/1`)
        .then(response => {
          let { data } = response;
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          expect(data.name).to.be.equal("Luke Skywalker");
          expect(data.name).to.not.equal("Star Wars");
        }).catch(() => {
          throw new Error("Unable to fetch person 1");
        });
    });

    it('should be able to fetch the first 10 people', function () {
      axios
        .get(`${baseUrl}/people`)
        .then(response => {
          let { data } = response;
          var people = data.results.map((person) => {
            return person.name;
          });
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          expect(people).to.be.an('array').that.includes('C-3PO');
          expect(people).to.be.an('array').that.does.not.include('C-3POzzz');
        }).catch(() => {
          throw new Error("Unable to fetch first 10 people");
        });
    });

    // ['name', 'mass', 'height']
    it('should be able to sort the first 10 people by name alphabetically', function () {
      return axios
        .get(`${baseUrl}/people/?sort=name`)
        .then(response => {
          let { data } = response;
          var people = data.results.map((person) => {
            return person.name;
          });
          // ["Beru Whitesun lars", "Biggs Darklighter", "C-3PO", "Darth Vader", "Leia Organa", "Luke Skywalker", "Obi-Wan Kenobi", "Owen Lars", "R2-D2", "R5-D4"]
          // copy the array, sort it
          // then compare it to itself
          var sortedPeople = people.slice(0).sort();
          expect(sortedPeople).to.eql(people);
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        }).catch(() => {
          throw new Error("Not sorted");
        });
    });

  });

  describe("planets", function () {
    it('should be able to fetch planet #1', function () {
      return axios
        .get(`${baseUrl}/planets/1`)
        .then(response => {
          let { data } = response;
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          expect(data.name).to.be.equal("Tatooine");
          expect(data.name).to.not.equal("Star Wars");
        }).catch(() => {
          throw new Error("Unable to fetch planet #1");
        });
    });

    it('should be able to fetch the first 10 planets', function () {
      return axios
        .get(`${baseUrl}/planets`)
        .then(response => {
          let { data } = response;
          var planets = data.results.map((planet) => {
            return planet.name;
          });
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          expect(planets).to.be.an('array').that.includes("Hoth");
          expect(planets).to.be.an('array').that.does.not.include("Hoath");
        }).catch(() => {
          throw new Error("Unable to fetch first 10 planets");
        });
    });
  });

});