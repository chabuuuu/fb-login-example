import express from "express";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import https from "https";
import fs from "fs";
import path from "path";
const app = express();
app.use(express.json());

// API nhận accessToken từ frontend và trả JWT token từ backend
app.post("/api/auth/facebook", async (req, res) => {
  const { accessToken } = req.body;

  try {
    // Gửi yêu cầu đến Facebook để xác thực accessToken và lấy thông tin người dùng
    const response = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,email,name,picture`
    );
    const userData = await response.json();

    if (userData.error) {
      return res
        .status(400)
        .json({ success: false, message: "Authentication failed" });
    }

    /**
     User data: {
        id: '',
        email: '',
        name: '',
        picture: {
            data: {
            height: 50,
            is_silhouette: false,
            url: '',
            width: 50
            }
        }
    }
     */
    console.log("User data:", userData);

    // Tạo token JWT của backend
    const token = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      "YOUR_SECRET_KEY",
      { expiresIn: "1h" }
    );

    // Trả về token JWT cho frontend
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error verifying Facebook token:", error);
    res.status(400).json({ success: false, message: "Authentication failed" });
  }
});

app.get("/", (req, res) => {
  console.log("ok");

  res.sendFile(
    "/home/haphuthinh/Workplace/School_project/test/login-fb/login-fb.html"
  );
});

const options = {
  key: fs.readFileSync("/home/haphuthinh/localhost.key"),
  cert: fs.readFileSync("/home/haphuthinh/localhost.crt"),
};

https.createServer(options, app).listen(3000, () => {
  console.log("Server running at https://localhost:3000");
});
