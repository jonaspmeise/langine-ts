import { expect } from "chai";

describe("Sum numbers", () => {
    it("it should sum two numbers correctly", () => { 
      const sum = 1 + 2;
      const expectedResult = 3;
      expect(sum).to.equal(expectedResult);
    })
});