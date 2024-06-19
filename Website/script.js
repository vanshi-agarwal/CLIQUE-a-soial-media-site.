let components;
const logoutbtn = document.getElementById("side-bar-button8");
logoutbtn.addEventListener("click", function (e) {
  e.preventDefault();
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("authToken");
  showComponent("login");
});

document.addEventListener("DOMContentLoaded", function () {
  // Check if user data exists in sessionStorage
  const storedUserData = sessionStorage.getItem("userData");
  console.log("storedUserData", storedUserData);

  // Define your component elements here. Make sure these IDs match your HTML elements.
  components = {
    discovery: document.getElementById("discovery"),
    photos: document.getElementById("photos"),
    profile: document.getElementById("profile"),
    login: document.getElementById("login"),
    register: document.getElementById("register"),
    posts: document.getElementById("posts"),
  };

  // Define the mapping between buttons and the components they should show.
  const buttonComponentMapping = {
    "side-bar-button2": "discovery",
    "side-bar-button1": "photos",
    "side-bar-button3": "profile",
    "side-bar-button5": "login",
    "side-bar-button6": "register",
    "side-bar-button9": "posts",
  };

  // Attach event listeners to buttons
  Object.keys(buttonComponentMapping).forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => {
        if (buttonId === "side-bar-button3") fetchUsers();
        return showComponent(buttonComponentMapping[buttonId]);
      });
    }
  });
});

function showComponent(componentId, flag = false) {
  Object.values(components).forEach((component) => {
    console.log(component);
    component.style.display = "none";
  });
  const storedUserData = sessionStorage.getItem("userData");
  const userData = storedUserData ? JSON.parse(storedUserData) : {};
  if (componentId === "profile") {
    updateProfile(userData);
  }
  if (componentId === "posts" && !flag) {
    console.log(userData._id);
    fetchUserPosts(userData._id);
  }
  if (components[componentId]) {
    console.log("called");
    components[componentId].style.display = "block";
  }
}

let appState = {
  currentUser: null,
};

function fetchUsers() {
  fetch("http://localhost:8080/m00885750/users")
    .then((response) => response.json())
    .then((users) => {
      const container = document.getElementById("usersContainer");
      container.innerHTML = "";
      users.forEach((user) => {
        createUserProfileElement(user, container);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function updateProfile(userData) {
  // Update profile image
  const profileImg = document.querySelector(".profile-img");
  profileImg.src = userData.profile.profilePicture || "./assests/Image.jpeg"; // Fallback to default image if null

  // Update user's name and bio
  const userName = document.querySelector(".h2-profile");
  userName.textContent = userData.name;

  const userBio = document.querySelector(".p-profile");
  userBio.textContent = `Bio: ${
    userData.profile.bio || "Traveler To New York"
  }`; // Fallback to default bio if empty

  // Update profile details
  const postsCount = document.querySelector(
    ".profile-details div:nth-child(1) p:first-child"
  );
  console.log(userData.postsCount);
  postsCount.textContent = userData.postsCount;

  const followersCount = document.querySelector(
    ".profile-details div:nth-child(2) p:first-child"
  );
  followersCount.textContent = userData.followersCount;

  const followingCount = document.querySelector(
    ".profile-details div:nth-child(3) p:first-child"
  );
  followingCount.textContent = userData.followingsCount;

  // Update total statistics
  // Assuming the statistics are directly related to the user data structure
  const totalLikes = document.querySelector(
    ".status-data-div:nth-child(1) p:last-child"
  );
  totalLikes.textContent = userData.likesCount || "0"; // Assuming you have likesCount in your user data

  const totalFollowers = document.querySelector(
    ".status-data-div:nth-child(2) p:last-child"
  );
  totalFollowers.textContent = userData.followersCount;

  const totalPosts = document.querySelector(
    ".status-data-div:nth-child(3) p:last-child"
  );
  totalPosts.textContent = userData.postsCount;

  // Update achievements
  // This part would need to be dynamic based on what achievements you track and how they're structured
  // Here's an example of updating one achievement
  const committedTravelerPoints = document.querySelector(
    ".achive-data-div:nth-child(1) .above-bar"
  );
  committedTravelerPoints.textContent = `Committed Traveler`;

  const committedTravelerProgress = document.querySelector(
    ".achive-data-div:nth-child(1) .below-bar"
  );
  committedTravelerProgress.textContent = `Earn ${
    userData.travelMiles || "0"
  } Points`;

  const committedTravelerBar = document.querySelector(
    ".achive-data-div:nth-child(1) .inner-bar"
  );
  // Assuming 1200 is the max points for this achievement, calculate width percentage
  const progressPercent = Math.min((userData.travelMiles / 1200) * 100, 100);
  committedTravelerBar.style.width = `${progressPercent}%`;
}

const loginButton = document.getElementById("loginBtn");
loginButton.addEventListener("click", function (e) {
  e.preventDefault();
  const reqBody = {
    email: document.getElementById("login-email").value,
    password: document.getElementById("login-password").value,
  };
  console.log(reqBody);
  fetch("http://localhost:8080/m00885750/login", {
    method: "POST", // Specify the method
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: document.getElementById("login-email").value,
      password: document.getElementById("login-password").value,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((res) => {
      console.log(res.user, res.token);
      if (res.user) {
        alert("Login Sucessful");
        sessionStorage.setItem("userData", JSON.stringify(res.user));
        sessionStorage.setItem("authToken", JSON.stringify(res.token));
        fetchUsers();
        showComponent("profile");
      }
    })
    .catch((error) => {
      alert(error);
    });
});

const registerButton = document.getElementById("registerBtn");
registerButton.addEventListener("click", function (e) {
  e.preventDefault();

  fetch("http://localhost:8080/m00885750/register", {
    method: "POST", // Specify the method
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-password").value,
      name: document.getElementById("reg-name").value,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((res) => {
      console.log(res.user, res.token);
      if (res.user) {
        alert("resgister Sucessful");
        sessionStorage.setItem("userData", JSON.stringify(res.user));
        sessionStorage.setItem("authToken", JSON.stringify(res.token));
        fetchUsers();
        showComponent("profile");
      }
    })
    .catch((error) => {
      alert(`${error.message}`);
    });
});

document.getElementById("postForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const authToken = sessionStorage.getItem("authToken") || "";

  fetch("http://localhost:8080/m00885750/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: formData,
  })
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(({ newPost }) => {
      console.log(newPost);
      showComponent("posts");
      // Here you can redirect to the newly created post or update your UI accordingly
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

// Function to create a user profile element
function createUserProfileElement(user, container) {
  // Create the user profile element
  const userProfile = document.createElement("div");
  userProfile.innerHTML = "";
  userProfile.classList.add("user-profile");
  userProfile.setAttribute("data-user-id", user._id);

  // Add the user's name and a view profile button to the userProfile element
  userProfile.innerHTML = `
  <div class="flex inner-div-friends">
                <div class="flex align-item-centre inner-div-friends2 view-profile">
                  <img
                    src="./assets/Image.jpeg"
                    alt="profile-pic"
                    class="extra-small-img"
                  />
                  <p>${user.name}</p>
                </div>
                <div>
                  <button class="white-button">Follow</button>
                </div>
              </div>
  `;

  // Append the userProfile element to the container
  container.appendChild(userProfile);

  // Add click event listener to the view profile button
  userProfile
    .querySelector(".view-profile")
    .addEventListener("click", function () {
      const userId =
        this.parentElement.parentElement.getAttribute("data-user-id");
      fetchUserPosts(userId); // Function to fetch and display the user's posts
      showComponent("posts", true);
    });

  // Add event listener to the follow button
  userProfile
    .querySelector(".white-button")
    .addEventListener("click", function () {
      this.setAttribute("data-user-id", user._id);

      const userId = this.getAttribute("data-user-id");
      console.log(this);
      const targetUserId = JSON.parse(sessionStorage.getItem("userData"));
      console.log(userId, targetUserId["_id"]);
      followUser(userId, targetUserId["_id"]);
    });
}

async function followUser(userId, targetUserId) {
  try {
    const response = await fetch(
      `http://localhost:8080/m00885750/users/${userId}/follow/${targetUserId}`,
      {
        method: "POST",
      }
    );
    if (response.ok) {
      const result = await response.text(); // Or response.json() if your server sends JSON
      alert(result); // Show a success message
    } else {
      const error = await response.text(); // Or response.json() for more detailed JSON error
      alert("Failed to follow user: " + error);
    }
  } catch (error) {
    console.error("Error following user:", error);
    alert("Failed to follow user: " + error.message);
  }
}

function fetchUserPosts(userId) {
  // Use `userId` to fetch the user's posts from the backend
  fetch(`http://localhost:8080/m00885750/posts/${userId}`)
    .then((response) => response.json())
    .then((posts) => {
      // Update the UI with the fetched posts
      console.log(posts);
      updateFeed(posts);
    })
    .catch((error) => console.error("Error:", error));
}

async function fetchUserDetails(userId) {
  const response = await fetch(
    `http://localhost:8080/m00885750/users/${userId}`
  );
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}
async function buildCommentsSection(postData) {
  const commentsContainer = document.createElement("div");
  commentsContainer.className = "comments-section";

  for (const comment of postData.comments) {
    try {
      const { user } = await fetchUserDetails(comment.authorid);
      console.log("user", user, comment);
      const commentElement = document.createElement("p");
      commentElement.style.color = "#333";
      commentElement.innerHTML = `<b><span>${user.name}:</span></b> ${comment.content}`;
      commentsContainer.appendChild(commentElement);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Optionally handle the error by displaying a default message
      const commentElement = document.createElement("p");
      commentElement.textContent = `Error loading comment by user ID ${comment.authorid}`;
      commentsContainer.appendChild(commentElement);
    }
  }

  return commentsContainer;
}

async function createPostElement(postData) {
  // Create post container
  const postComponent = document.createElement("div");
  postComponent.className = "post";
  postComponent.id = `post_${postData._id}`; // Unique ID for the post element

  // Add the HTML structure for the post with dynamic data
  postComponent.innerHTML = `
    <div class="post-header">
      <div class="user-details">
        <strong class="user-name">${postData.authorname}</strong>
        <span class="post-date">${new Date(
          postData.createdAt
        ).toLocaleDateString("en-US")}</span>
      </div>
    </div>
    <div class="post-content">
      <p>${postData.content}</p>
      ${
        postData.imageUrl
          ? `<img src="${postData.imageUrl}" alt="Post image" class="post-img"/>`
          : ""
      }
    </div>
    <div class="post-actions">
      <button id="like-btn-${postData._id}" class="like-btn"> Like</button>
      <span class="likes-count">${postData.likesCount} Likes</span>
      <input class="comment-content" type="text" id="comment-content-${
        postData._id
      }" placeholder="Write a comment...">
      <button id="comment-btn-${
        postData._id
      }" class="comment-btn"> comment</button>
      <span class="comments-count">${postData.commentsCount} Comments</span>
      <button class="share-btn">Share</button>
      <span class="shares-count">${postData.sharedCount} Shares</span>
    </div>
    
    </div>
  `;

  const commentsSection = await buildCommentsSection(postData);
  postComponent.appendChild(commentsSection);

  postComponent.addEventListener("click", function (event) {
    if (event.target.classList.contains("like-btn")) {
      const postId = event.target.id.replace("like-btn-", "");
      toggleLike(postId);
    }
    if (event.target.classList.contains("comment-btn")) {
      const postId = event.target.id.replace("comment-btn-", "");
      const commentInput = document.getElementById(`comment-content-${postId}`);
      const content = commentInput.value;
      submitComment(postId, content);
    }
  });
  return postComponent;
}

async function toggleLike(postId) {
  try {
    const authToken = sessionStorage.getItem("authToken") || "";

    const response = await fetch(
      `http://localhost:8080/m00885750/posts/${postId}/like`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    const message = await response.text();
    console.log(message);
    // Optionally, update the UI based on the like/unlike action
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

async function submitComment(postId, content) {
  if (!content) {
    alert("Please write a comment.");
    return;
  }
  const authToken = sessionStorage.getItem("authToken") || "";

  try {
    const response = await fetch(
      `http://localhost:8080/m00885750/posts/${postId}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content }),
      }
    );
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      const postElement = document.getElementById(`post_${postId}`);
      const commentsSection = postElement.querySelector(".comments-section");
      const newComment = document.createElement("div");
      newComment.className = "comment-item";
      newComment.textContent = data.comment.content; // Assuming 'data.comment.content' is the structure
      commentsSection.appendChild(newComment);
      document.getElementById(`comment-content-${postId}`).value = ""; // Clear the input field
    } else {
      console.error("Failed to submit comment:", data.error);
    }
  } catch (error) {
    console.error("Error submitting comment:", error);
  }
}

// Function to update the feed with all posts
function updateFeed(postsData) {
  // Find the feed container in the DOM
  const feedContainer = document.getElementsByClassName("feedContainer")[0];
  feedContainer.innerHTML = ""; // Clear existing posts

  // Iterate over each post data and create post elements
  postsData.forEach(async (postData) => {
    const postElement = await createPostElement(postData);
    feedContainer.appendChild(postElement);
  });
}
