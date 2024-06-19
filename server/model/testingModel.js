const mongodb = require("mongodb");
const getDb = require("../utils/database").getDb;

const ObjectId = mongodb.ObjectId;

class Test {
  constructor(name, age, rollNo, place) {
    this.name = name;
    this.age = +age;
    this.rollNo = rollNo;
    this.place = place;
    this.dateCreated = Date.now();
  }
  save() {
    const db = getDb();
    return db.collection("tests").insertOne(this);
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection("tests")
      .findOne({ _id: new ObjectId(id) })
      .then((test) => {
        return test;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
module.exports = Test;
