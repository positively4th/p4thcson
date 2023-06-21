import { expect } from "chai";
import cson from "../src/cson.js";

describe("cson js", () => {
  it("test string", () => {
    const exp = "test_string";
    const act = cson.fromJSON(cson.asJSON(exp));
    expect(act).to.deep.equal(exp);
  });

  it("test list", () => {
    const exp = ["a", 1];
    const act = cson.fromJSON(cson.asJSON(exp));
    expect(act).to.deep.equal(exp);
  });

  it("test map", () => {
    const exp = { a: 1, 2: "b" };
    const act = cson.fromJSON(cson.asJSON(exp));
    expect(act).to.deep.equal(exp);
  });

  it("test circular map", () => {
    const taintedObjects = [];
    const getId = cson.getId.bind(null, taintedObjects);

    const a = { id: "a", next: null };
    const b = { id: "b", next: null };
    const c = { id: "c", next: null };
    a.next = b;
    b.next = c;
    c.next = a;
    const exp = a;
    const act = cson.fromJSON(cson.asJSON(exp));
    expect(act.id).to.equal("a");
    expect(act.next.id).to.equal("b");
    expect(act.next.next.id).to.equal("c");
    expect(getId(act)).to.equal(getId(act.next.next.next));
    expect(getId(act.next)).to.equal(getId(act.next.next.next.next));
    expect(getId(act.next.next)).to.equal(getId(act.next.next.next.next.next));
  });

  it("test circular list", () => {
    const taintedObjects = [];
    const id = cson.getId.bind(null, taintedObjects);

    const a = { id: "a", next: null };
    const b = { id: "b", next: null };
    const c = { id: "c", next: null };
    a.next = b;
    b.next = c;
    c.next = a;
    const exp = [a, b, c];

    const x = [
      cson.fromJSON(cson.asJSON(exp)),
      cson.fromJSON(JSON.parse(cson.asJSON(exp)), { isJSON: false }),
    ];
    x.forEach((act) => {
      expect(act[0]["id"]).to.equal("a");
      expect(act[0]["next"]["id"]).to.equal("b");
      expect(act[0]["next"]["next"]["id"]).to.equal("c");

      expect(id(act[0])).to.equal(id(act[0]["next"]["next"]["next"]));
      expect(id(act[0]["next"])).to.equal(
        id(act[0]["next"]["next"]["next"]["next"])
      );
      expect(id(act[0]["next"]["next"])).to.equal(
        id(act[0]["next"]["next"]["next"]["next"]["next"])
      );
    });
  });
});
