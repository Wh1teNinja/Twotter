const chai = require("chai");
const expect = require("chai").expect;
const db = require("../model/db");

chai.use(require("chai-as-promised"));

/*
* I will keep these tests simple because, unfortunately, I don't have time
* to deal with problem of complete handling of promises' rejection with chai(it is not easy).
*/
describe("Login data validation",  () => {
  describe("wrong data", () => {
    it("Must not accept missing username and password", () => {
      let data = { username: "", password: "" };

      return expect(db.authenticateUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept missing username", () => {
      let data = { username: "", password: "12345678" };

      return expect(db.authenticateUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept missing password", () => {
      let data = { username: "Admin", password: "" };

      return expect(db.authenticateUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept wrong format username", () => {
      let data = { username: "Admin!", password: "12345678" };

      return expect(db.authenticateUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept wrong password", () => {
      let data = { username: "Admin", password: "123456789" };

      return expect(db.authenticateUser(data))
        .to.be.rejectedWith(new Array());
    });
  });
});
