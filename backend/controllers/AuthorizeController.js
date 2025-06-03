const jwt = require("jsonwebtoken");
const User = require("../models/User");
const argon2 = require("argon2");

const generateToken = (payload) => {
  const { id, username } = payload;
  const accessToken = jwt.sign(
    { id, username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  return accessToken;
};

const checkEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
};

const checkPhoneNumber = (phoneNumber) => {
  return /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phoneNumber);
};

class AuthorizeController {
  signup = async (req, res) => {
    const { username, password, email, phoneNumber, fullName } = req.body;
    console.log(req.body);
    try {
      if (!checkEmail(email)) throw new Error("invalid_email");
      if (!checkPhoneNumber(phoneNumber)) throw new Error("invalid_phone");

      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error("username_exists");

      const hashedPassword = await argon2.hash(password);

      const newUser = new User({
        username,
        password: hashedPassword,
        fullName,
        email,
        phoneNumber,
        avatarUrl: "", // Không dùng avatar, để rỗng
        ifHasAvatar: false,
      });

      await newUser.save();
      res
        .status(201)
        .json({ success: true, message: "Người dùng đã được tạo thành công" });
    } catch (err) {
      if (err.message === "username_exists") {
        res
          .status(400)
          .json({ success: false, message: "Tên tài khoản đã tồn tại" });
      } else if (err.message === "invalid_email") {
        res
          .status(400)
          .json({ success: false, message: "Email sai định dạng" });
      } else if (err.message === "invalid_phone") {
        res
          .status(400)
          .json({ success: false, message: "Số điện thoại sai định dạng" });
      } else {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }
    }
  };

  login = async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    try {
      const user = await User.findOne({ username });
      if (!user) throw new Error("user_not_found");

      console.log(user);

      const passwordValid = await argon2.verify(user.password, password);
      if (!passwordValid) throw new Error("wrong_password");

      const token = generateToken(user);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      });
    } catch (err) {
      if (err.message === "user_not_found") {
        res
          .status(400)
          .json({ success: false, message: "Người dùng không tồn tại" });
      } else if (err.message === "wrong_password") {
        res.status(400).json({ success: false, message: "Sai mật khẩu" });
      } else {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi máy chủ" });
      }
    }
  };
}

module.exports = new AuthorizeController();
