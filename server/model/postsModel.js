const mongodb = require("mongodb");
const getDb = require("../utils/database").getDb;

const ObjectId = mongodb.ObjectId;

class Post {
  constructor(authorid, authorname, content, imageUrl) {
    this.authorid = new ObjectId(authorid);
    this.authorname = authorname;
    this.content = content;
    this.imageUrl = imageUrl;
    this.likesCount = 0;
    this.commentsCount = 0;
    this.sharedCount = 0;
    this.likes = []; //it will hold userid of whom who've liked the post
    this.comments = []; //it will hold userobject of whom who've commented on the post userobj = {id, authorid, content, timestamp}
    this.createdAt = Date.now();
  }

  save() {
    const db = getDb();

    return db.collection("posts").insertOne(this);
  }

  static save(postId, dataToUpdate) {
    const db = getDb();
    return db
      .collection("posts")
      .updateOne({ _id: postId }, { $set: dataToUpdate });
  }

  static find(following_array) {
    const db = getDb();
    return db
      .collection("posts")
      .find({ authorid: { $in: following_array } })
      .sort({ createdAt: -1 })
      .toArray()
      .then((posts) => posts)
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchPostsOfUser(userid) {
    const db = getDb();
    return db
      .collection("posts")
      .find({ authorid: new ObjectId(userid) }) // Use the correct field and ObjectId for matching
      .toArray()
      .then((posts) => posts)
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(postId) {
    const db = getDb();
    return db
      .collection("posts")
      .findOne({ _id: new ObjectId(postId) })
      .then((posts) => posts)
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Post;
