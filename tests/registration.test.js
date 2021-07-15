const chai = require("chai");
const expect = require("chai").expect;
const db = require("../model/db");

chai.use(require("chai-as-promised"));

/*
* I will keep these tests simple because, unfortunately, I don't have time
* to deal with problem of complete handling of promises' rejection with chai(it is not easy).
*/
describe("Registration data validation",  () => {
  describe("wrong data", () => {
    it("Must not accept missing fields", () => {
      let data = { username: "", password: "", confirmPassword: "" };

      return expect(db.addUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept missing username and password", () => {
      let data = { username: "", password: "", confirmPassword: "12345678" };

      return expect(db.addUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept missing password", () => {
      let data = { username: "Admin", password: "", confirmPassword: "12345678" };

      return expect(db.addUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept missing confirmPassword", () => {
      let data = { username: "Admin", password: "12345678", confirmPassword: "" };

      return expect(db.addUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept wrong format username", () => {
      let data = { username: "Admin!", password: "12345678", confirmPassword: "12345678" };

      return expect(db.addUser(data))
        .to.be.rejectedWith(new Array());
    });

    it("Must not accept wrong not matching passwords", () => {
      let data = { username: "Admin", password: "12345678", confirmPassword: "12345679" };

      return expect(db.addUser(data))
        .to.be.rejectedWith(new Array());
    });
  });
});
