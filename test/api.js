const axios = require("axios");
const expect = require("chai").expect;

let baseUrl = "http://localhost:3000";

describe("api endpoints", function() {
  describe("people", function() {
    it("should be able to fetch person #1", function(done) {
      axios
        .get(`${baseUrl}/people/1`)
        .then(response => {
          let { data } = response;
          expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
          expect(data.name).to.be.equal("Luke Skywalker");
          expect(data.name).to.not.equal("Star Wars");
          done()
        })
        .catch(e => {
          console.log(e);
          done(e);
        });
    });

    it("should be able to fetch all the people", function(done) {
      axios
        .get(`${baseUrl}/people`)
        .then(response => {
          let { data } = response;
          let people = data.results.map(person => {
            return person.name;
          });
          expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
          expect(people)
            .to.be.an("array")
            .that.includes("C-3PO");
          expect(people)
            .to.be.an("array")
            .that.does.not.include("C-3POzzz");
          done();
        })
        .catch(e => {
          console.log(e);
          done(e);
        });
    });

    // ['name', 'mass', 'height']
    describe("sorting", function() {
      it("should be able to sort the first 10 people by name alphabetically", function(done) {
        axios
          .get(`${baseUrl}/people/?sort=name`)
          .then(response => {
            let { data } = response;
            let people = data.results.map(person => {
              return person.name;
            }).slice(0,10);
            // copy the array, sort it
            // then compare it to original
            let sortedPeople = people.slice(0).sort();
            expect(sortedPeople).to.eql(people);
            expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
            done();
          })
          .catch(e => {
            console.log(e);
            done(e);
          });
      });

      it("should be able to sort the first 10 people by mass", function(done) {
        axios
          .get(`${baseUrl}/people/?sort=mass`)
          .then(response => {
            let people = response.data.results.map(person => {
              return person.name;
            }).slice(0,10);

            let sortedPeople = ["Padmé Amidala", "Jabba Desilijic Tiure", "Sly Moore", "Leia Organa", "Wat Tambor", "Ratts Tyerell", "R5-D4", "R2-D2", "Adi Gallia", "Dud Bolt"];

            expect(sortedPeople).to.eql(people);
            expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
            done();
          })
          .catch(e => {
            console.log(e);
            done(e);
          });
      });

      it("should be able to sort the first 10 people by height", function(done) {
        axios
          .get(`${baseUrl}/people/?sort=height`)
          .then(response => {
            let people = response.data.results.map(person => {
              return person.name;
            }).slice(0,10);

            let sortedPeople = ["Yoda", "Ratts Tyerell", "Wicket Systri Warrick", "Dud Bolt", "R2-D2", "R4-P17", "R5-D4", "Sebulba", "Gasgano", "Watto"];

            expect(sortedPeople).to.eql(people);
            expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
            done();
          })
          .catch(e => {
            console.log(e);
            done(e);
          });
      });

      it("should be able to sort the people by name alphabetically in REVERSE ORDER", function(done) {
        axios
          .get(`${baseUrl}/people/?sort=name&reverseOrder=true`)
          .then(response => {
            let { data } = response;
            let people = data.results.map(person => {
              return person.name;
            });
            // copy the array, sort it, then reverse
            // then compare it to original
            let sortedPeople = people
              .slice(0)
              .sort()
              .reverse();
            expect(sortedPeople).to.eql(people);
            expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
            done();
          })
          .catch(e => {
            console.log(e);
            done(e);
          });
      });
    });
  });

  describe("planets", function() {
    it("should be able to fetch planet #1", function(done) {
      axios
        .get(`${baseUrl}/planets/1`)
        .then(response => {
          let { data } = response;
          expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
          expect(data.name).to.be.equal("Tatooine");
          expect(data.name).to.not.equal("Star Wars");
          done();
        })
        .catch(e => {
          console.log(e);
          done(e);
        });
    });

    it("should be able to fetch planet #2 and show resident names instead of URLs", function(done) {
      let residents = ["Leia Organa", "Bail Prestor Organa", "Raymus Antilles"];
      axios
        .get(`${baseUrl}/planets/2/residents`)
        .then(response => {
          let { data } = response;
          expect(data.residents).to.eql(residents);
          expect(response.headers["content-type"]).to.equal("application/json; charset=utf-8");
          done();
        })
        .catch(e => {
          console.log(e);
          done(e);
        });
    });

    it("should be able to fetch all the planets", function(done) {
      axios
        .get(`${baseUrl}/planets`)
        .then(response => {
          let { data } = response;
          let planets = data.results.map(planet => {
            return planet.name;
          });
          expect(response.headers["content-type"]).to.equal(
            "application/json; charset=utf-8"
          );
          expect(planets)
            .to.be.an("array")
            .that.includes("Hoth");
          expect(planets)
            .to.be.an("array")
            .that.does.not.include("Hoath");
          done();
        })
        .catch(e => {
          console.log(e);
          done(e);
        });
    });

    // ['name', 'population', 'diameter']
    describe("sorting", function() {
      it("should be able to sort the planets by name alphabetically", function(done) {
        axios
          .get(`${baseUrl}/planets/?sort=name`)
          .then(response => {
            let { data } = response;
            let planets = data.results.map(planet => {
              return planet.name;
            });
            // ['Alderaan', 'Bespin', 'Coruscant', 'Dagobah', 'Endor', 'Geonosis', 'Hoth', 'Kamino', 'Naboo', 'Yavin IV']
            // copy the array, sort it
            // then compare it to original
            let sortedPlanets = planets.slice(0).sort();
            expect(sortedPlanets).to.eql(planets);
            expect(response.headers["content-type"]).to.equal(
              "application/json; charset=utf-8"
            );
            done();
          })
          .catch(e => {
            console.log(e);
            done();
          });
      });

      it("should be able to sort the first 10 planets by population", function(done) {
        axios
          .get(`${baseUrl}/planets/?sort=population`)
          .then(response => {
            let { data } = response;
            let planets = data.results
              .map(planet => {
                return planet.name;
              })
              .slice(0, 10);

            let sortedPlanets = [
              "Tund",
              "Yavin IV",
              "Dantooine",
              "Dathomir",
              "Mustafar",
              "Tatooine",
              "Haruun Kal",
              "Polis Massa",
              "Bespin",
              "Felucia"
            ];

            expect(sortedPlanets).to.eql(planets);
            expect(response.headers["content-type"]).to.equal(
              "application/json; charset=utf-8"
            );
            done();
          })
          .catch(e => {
            console.log(e);
            done(e);
          });
      });

      it("should be able to sort the first 10 planets by diameter", function(done) {
        axios
          .get(`${baseUrl}/planets/?sort=diameter`)
          .then(response => {
            let { data } = response;
            let planets = data.results
              .map(planet => {
                return planet.name;
              })
              .slice(0, 10);

            let sortedPlanets = [
              "Stewjon",
              "Cato Neimoidia",
              "Polis Massa",
              "unknown",
              "Trandosha",
              "Socorro",
              "Mustafar",
              "Endor",
              "Bestine IV",
              "Hoth"
            ];

            expect(sortedPlanets).to.eql(planets);
            expect(response.headers["content-type"]).to.equal(
              "application/json; charset=utf-8"
            );
            done();
          })
          .catch(e => {
            console.log(e);
            done(e);
          });
      });

      it("should be able to sort the planets by name alphabetically in REVERSE ORDER", function(done) {
        axios
          .get(`${baseUrl}/planets/?sort=name&reverseOrder=true`)
          .then(response => {
            let { data } = response;
            let planets = data.results.map(planet => {
              return planet.name;
            });
            // copy the array, sort it, then reverse
            // then compare it to original
            let sortedPlanets = planets
              .slice(0)
              .sort()
              .reverse();
            expect(sortedPlanets).to.eql(planets);
            expect(response.headers["content-type"]).to.equal(
              "application/json; charset=utf-8"
            );
            done();
          })
          .catch(e => {
            console.log(e);
            done(e);
          });
      });
    });
  });
});
