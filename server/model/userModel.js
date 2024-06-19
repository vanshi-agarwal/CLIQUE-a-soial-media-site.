const mongodb = require("mongodb");
const getDb = require("../utils/database").getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(
    name,
    email,
    password,
    bio = "",
    postsCount = 0,
    followersCount = 0,
    followingsCount = 0,
    placesVisited = 0,
    travelMiles = 0
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.profile = {
      bio,
      profilePicture: null,
      country: null,
    };
    this.postsCount = postsCount;
    this.followersCount = followersCount;
    this.followingsCount = followingsCount;
    this.followers = [];
    this.followings = [];
    this.posts = [];
    this.placesVisited = placesVisited;
    this.travelMiles = travelMiles;
    this.dateCreated = Date.now();
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static save(authorid, dataToUpdate) {
    const db = getDb();
    console.log(authorid, dataToUpdate);
    return db
      .collection("users")
      .updateOne({ _id: new ObjectId(authorid) }, { $set: dataToUpdate });
  }

  static findOne(email) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ email: email })
      .then((user) => {
        console.log(1, user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(userid) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new ObjectId(userid) })
      .then((user) => {
        console.log(1, user);
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static updateProfile(userid, bio, profilePicture, country) {
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userid) },
        {
          $set: {
            profile: { bio, profilePicture, country },
          },
        }
      )
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findAll() {
    const db = getDb();
    return db
      .collection("users")
      .find()
      .toArray()
      .then((users) => {
        return users;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static createPost() {}

  static async follow(userId, targetUserId) {
    const db = getDb();
    try {
      const users = await Promise.all([
        db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $addToSet: { followers: new ObjectId(targetUserId) },
            $inc: { followersCount: 1 },
          }
        ),
        db.collection("users").updateOne(
          { _id: new ObjectId(targetUserId) },
          {
            $addToSet: { followings: new ObjectId(userId) },
            $inc: { followingsCount: 1 },
          }
        ),
      ]);
      return users;
    } catch (err) {
      console.log(err);
    }
  }

  static async unfollow(userId, targetUserId) {
    const db = getDb();
    try {
      const users = await Promise.all([
        db.collection("users").updateOne(
          { _id: new ObjectId(userId) },
          {
            $pull: { followers: new ObjectId(targetUserId) },
            $inc: { followersCount: -1 },
          }
        ),
        db.collection("users").updateOne(
          { _id: new ObjectId(targetUserId) },
          {
            $pull: { followings: new ObjectId(userId) },
            $inc: { followingsCount: -1 },
          }
        ),
      ]);
      return users;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = User;
