const express = require("express");
const Test = require("./model/testingModel");
const User = require("./model/userModel");
const Post = require("./model/postsModel");
const app = express();
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const mongoConnect = require("./utils/database").mongoConnect;
require("dotenv").config();
const fs = require("fs");
const isAuth = require("./middleware/is-auth");

// Function to convert image to Base64
const imageToBase64 = (filePath) => {
  // Read file buffer
  const fileBuffer = fs.readFileSync(filePath);
  // Convert buffer to Base64
  const base64String = fileBuffer.toString("base64");
  return base64String;
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); //directory with name 'images' should be created beforehand
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  // Use a response event listener to log headers just before sending the response
  res.on("finish", () => {
    console.log("Response Headers:", res.getHeaders());
  });
  next();
});

app.get("/feed", async (req, res) => {
  try {
    // Assume we have the logged-in user's ID
    // const currentUserId = req.user;
    const currentUserId = "661816df97d3b617edca6154";

    // Fetch the list of IDs the user is following
    const currentUser = await User.findById(currentUserId);
    const followingList = currentUser.followings;

    // Fetch the posts for all the users being followed
    let posts = await Post.find(followingList);

    // Optionally, add more details to the posts like author's name, profile picture etc.
    posts = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.authorid);
        return {
          ...post._doc,
          authorName: user.name,
          authorProfilePic: user.profile.profilePicture,
        };
      })
    );

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/m00885750/users/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    const user = await User.findById(userid);
    if (!user) return res.status(404).send("user not found");
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Fetch all users
app.get("/m00885750/users", async (req, res) => {
  try {
    const users = await User.findAll();
    if (!users.length) return res.status(404).send("users not found");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Posts of a single user
app.get("/m00885750/posts/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("ara", userId);
    const posts = await Post.fetchPostsOfUser(userId); // Adjust query as per your schema
    if (!posts.length) return res.status(404).json("posts not found");

    return res.status(200).json(posts);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.post("/m00885750/register", async (req, res) => {
  const { email, password, name } = req.body;
  console.log(req.body);
  let jwtToken;
  try {
    const user2 = await User.findOne(email);
    console.log(2, user2);
    if (user2) return res.send("already registerd");
    const user = new User(name, email, password);
    await user.save();
    jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    return res
      .status(201)
      .send({ message: "User created successfully", user, token: jwtToken });
  } catch (error) {
    return res.status(400).send(error);
  }
});

app.post("/m00885750/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let jwtToken;

    const user = await User.findOne(email);
    if (!user) return res.send("user not found");
    if (password !== user.password) {
      return res.send("user not authorized");
    }
    jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    return res
      .status(200)
      .send({ message: "Login successful", user, token: jwtToken });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.post("/m00885750/testing", async (req, res) => {
  const { name, age, place, rollNo } = req.body;
  try {
    const test = new Test(name, age, rollNo, place);
    await test.save();
    return res.status(201).send({ message: "test created successfully", test });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.get("/m00885750/testing/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const test = await Test.findById(id);
    if (!test) return res.send("test not found");
    return res.status(200).send({ message: "test found successfully", test });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

// Create post
app.post(
  "/m00885750/posts",
  isAuth,
  upload.single("photo"),
  async (req, res) => {
    const { content } = req.body;
    const image = req.file;
    const authorid = req.user; //fetch from req.user
    // const authorid = "661816df97d3b617edca6154"; //fetch from req.user
    try {
      const author = await User.findById(authorid);
      // Simulate database insertion
      // Usage example
      const base64Image = imageToBase64(image.path);
      const formattedBase64 = `data:${image.mimetype};base64,${base64Image}`;

      const newPost = new Post(authorid, author.name, content, formattedBase64);
      await newPost.save();
      author.posts.push(newPost._id.toString());
      author.postsCount++;
      console.log(author.posts, author.postsCount);
      const dataToUpdate = {
        posts: author.posts,
        postsCount: author.postsCount,
      };
      await User.save(authorid, dataToUpdate);
      // Add the new post to the database (pseudo code)
      console.log(newPost);
      // Respond with the new post data
      return res.status(201).json({ newPost });
    } catch (error) {
      console.log(error);
      return res.status(422).json({ error });
    }
  }
);

app.post("/m00885750/posts/:postId/like", isAuth, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user;
    // const userId = "661816df97d3b617edca6154";
    const post = await Post.findById(postId);
    let liked;
    // Fetch the post by ID

    // Check if the user already liked the post
    const userIndex = post.likes.findIndex((userid) => {
      console.log(userid.toString(), userId.toString());
      return userid.toString() === userId.toString();
    });
    console.log(userIndex);
    if (userIndex === -1) {
      // User hasn't liked the post yet, so like it
      post.likes.push(new ObjectId(userId));
      post.likesCount++;
      liked = true;
    } else {
      // User already liked the post, so unlike it
      post.likes.splice(userIndex, 1);
      post.likesCount = Math.max(0, post.likesCount - 1); // Avoid negative counts
      liked = false;
    }
    console.log(post);
    const dataToUpdate = { likes: post.likes, likesCount: post.likesCount };
    // Then, save the post using your existing save logic
    await Post.save(post._id, dataToUpdate);

    // for (let post of posts) {
    //   console.log(postId, post.likes);
    //   if (post.likes.includes(userId)) {
    //     // User already liked the post, so unlike it
    //     post.likes = post.likes.filter((userid) => userid !== userId);
    //     post.likesCount--;
    //     return res.status(200).send("Post unliked successfully.");
    //   } else {
    //     // Add like
    //     post.likes.push(userId);
    //     post.likesCount++;
    //     console.log(post);
    //     post.save();
    return res
      .status(200)
      .send(liked ? "Post liked successfully." : "Post unliked successfully.");
    //   }
    // }
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.post("/m00885750/posts/:postId/comment", isAuth, async (req, res) => {
  try {
    const userId = req.user;
    // const userId = "661816df97d3b617edca6154";
    const postId = req.params.postId;
    const { content } = req.body; // Assuming you send comment content in request body
    console.log(req.body);
    const comment = {
      id: new ObjectId(), // Generate a unique ID for the comment
      authorid: userId,
      content: content,
      timestamp: Date.now(),
    };

    // Find the post and add the comment

    const post = await Post.findById(postId);
    post.comments.push(comment);
    post.commentsCount++;
    const dataToUpdate = {
      comments: post.comments,
      commentsCount: post.commentsCount,
    };
    // Then, save the post using your existing save logic
    await Post.save(post._id, dataToUpdate);

    return res
      .status(200)
      .json({ message: "Comment added successfully.", comment: comment });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.post("/m00885750/users/:userId/follow/:targetUserId", async (req, res) => {
  const { userId, targetUserId } = req.params;
  console.log(userId, targetUserId);
  if (userId === targetUserId) {
    return res.status(400).send("Users cannot follow themselves.");
  }

  try {
    // Add targetUserId to current user's followings
    const updatedUser = await User.follow(
      userId,
      targetUserId // Use $addToSet to avoid duplicates
    );
    console.log("follow", updatedUser);

    res.send("Followed successfully.");
  } catch (error) {
    console.error("Follow operation failed:", error);
    res.status(500).send("Failed to follow user.");
  }
});

app.post(
  "/m00885750/users/:userId/unfollow/:targetUserId",
  async (req, res) => {
    const { userId, targetUserId } = req.params;

    try {
      // Remove targetUserId from current user's followings
      await User.unfollow(userId, targetUserId);

      res.send("Unfollowed successfully.");
    } catch (error) {
      console.error("Unfollow operation failed:", error);
      res.status(500).send("Failed to unfollow user.");
    }
  }
);

mongoConnect(() => {
  app.listen(8080, () => {
    console.log("App Running on port 8080");
  });
});
