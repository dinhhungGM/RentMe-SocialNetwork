let redisClient = require("./redisClient");

let EditData = (data, id, call) => {
  let newData = data.map((item) =>
    item.id === id ? { ...item, call } : item
  );
  return newData;
};

let SocketServer = (socket) => {
  // Connect - Disconnect
  socket.on("joinUser", async (user) => {
    let users = JSON.parse(await redisClient.get("users"));
    users.push({
      id: user._id,
      socketId: socket.id,
      followers: user.followers,
    });
  });

  socket.on("disconnect", async () => {
    let users = JSON.parse(await redisClient.get("users"));
    let data = users.find((user) => user.socketId === socket.id);
    if (data) {
      let clients = users.filter((user) =>
        data.followers.find((item) => item._id === user.id)
      );

      if (clients.length > 0) {
        clients.forEach((client) => {
          socket.to(`${client.socketId}`).emit("CheckUserOffline", data.id);
        });
      }

      if (data.call) {
        let callUser = users.find((user) => user.id === data.call);
        if (callUser) {
          users = EditData(users, callUser.id, null);
          socket.to(`${callUser.socketId}`).emit("callerDisconnect");
        }
      }
    }

    users = users.filter((user) => user.socketId !== socket.id);
    await redisClient.set("users", JSON.stringify(users));
  });

  // Likes
  socket.on("likePost", async (newPost) => {
    let users = JSON.parse(await redisClient.get("users"));
    let ids = [...newPost.user.followers, newPost.user._id];
    let clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("likeToClient", newPost);
      });
    }
  });

  socket.on("unLikePost", async (newPost) => {
    let users = JSON.parse(await redisClient.get("users"));
    let ids = [...newPost.user.followers, newPost.user._id];
    let clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("unLikeToClient", newPost);
      });
    }
  });

  // Comments
  socket.on("createComment", async (newPost) => {
    let users = JSON.parse(await redisClient.get("users"));
    let ids = [...newPost.user.followers, newPost.user._id];
    let clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("createCommentToClient", newPost);
      });
    }
  });

  socket.on("deleteComment", async (newPost) => {
    let users = JSON.parse(await redisClient.get("users"));
    let ids = [...newPost.user.followers, newPost.user._id];
    let clients = users.filter((user) => ids.includes(user.id));

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("deleteCommentToClient", newPost);
      });
    }
  });

  // Follow
  socket.on("follow", async (newUser) => {
    let users = JSON.parse(await redisClient.get("users"));
    let user = users.find((user) => user.id === newUser._id);
    user && socket.to(`${user.socketId}`).emit("followToClient", newUser);
  });

  socket.on("unFollow", async (newUser) => {
    let users = JSON.parse(await redisClient.get("users"));
    let user = users.find((user) => user.id === newUser._id);
    user && socket.to(`${user.socketId}`).emit("unFollowToClient", newUser);
  });

  // Notification
  socket.on("createNotify", async (msg) => {
    let users = JSON.parse(await redisClient.get("users"));
    let client = users.find((user) => msg.recipients.includes(user.id));
    client && socket.to(`${client.socketId}`).emit("createNotifyToClient", msg);
  });

  socket.on("removeNotify", async (msg) => {
    let users = JSON.parse(await redisClient.get("users"));
    let client = users.find((user) => msg.recipients.includes(user.id));
    client && socket.to(`${client.socketId}`).emit("removeNotifyToClient", msg);
  });

  // Message
  socket.on("addMessage", async (msg) => {
    let users = JSON.parse(await redisClient.get("users"));
    let user = users.find((user) => user.id === msg.recipient);
    user && socket.to(`${user.socketId}`).emit("addMessageToClient", msg);
  });

  // Check User Online / Offline
  socket.on("checkUserOnline", async (data) => {
    let users = JSON.parse(await redisClient.get("users"));
    let following = users.filter((user) =>
      data.following.find((item) => item._id === user.id)
    );
    socket.emit("checkUserOnlineToMe", following);

    let clients = users.filter((user) =>
      data.followers.find((item) => item._id === user.id)
    );

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket
          .to(`${client.socketId}`)
          .emit("checkUserOnlineToClient", data._id);
      });
    }
  });

  // Call User
  socket.on("callUser", async (data) => {
    let users = JSON.parse(await redisClient.get("users"));
    users = EditData(users, data.sender, data.recipient);

    let client = users.find((user) => user.id === data.recipient);

    if (client) {
      if (client.call) {
        socket.emit("userBusy", data);
        users = EditData(users, data.sender, null);
      } else {
        users = EditData(users, data.recipient, data.sender);
        socket.to(`${client.socketId}`).emit("callUserToClient", data);
      }
    }
  });

  socket.on("endCall", async (data) => {
    let users = JSON.parse(await redisClient.get("users"));
    let client = users.find((user) => user.id === data.sender);

    if (client) {
      socket.to(`${client.socketId}`).emit("endCallToClient", data);
      users = EditData(users, client.id, null);

      if (client.call) {
        let clientCall = users.find((user) => user.id === client.call);
        clientCall &&
          socket.to(`${clientCall.socketId}`).emit("endCallToClient", data);

        users = EditData(users, client.call, null);
      }
    }
  });
};

module.exports = SocketServer;
