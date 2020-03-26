import {expect} from "chai";
import parser from "../src/parser";

import arrowFunctionTests from "./parser/arrowfunction.test.js";

describe("Parser", function() {
  describe("#fat arrow functions", function() {
    it("parses expression", arrowFunctionTests.fatExpression);
    it("parses expression with body", arrowFunctionTests.fatExpressionBody);
  });

  describe("#thin arrow functions", function() {
    it("parses expression", arrowFunctionTests.thinExpression);
    it("parses expression with body", arrowFunctionTests.thinExpressionBody);
  });
});