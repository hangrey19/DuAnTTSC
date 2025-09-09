# 🎓 EduLab – Website học tập trực tuyến  

## 📖 Giới thiệu  
EduLab là hệ thống **học tập trực tuyến** hỗ trợ học sinh và giáo viên:  
- 👨‍🏫 **Giáo viên**: tạo lớp học, quản lý học sinh, đăng tải bài giảng, giao và chấm bài tập.  
- 👩‍🎓 **Học sinh**: tham gia lớp học, xem bài giảng, làm và nộp bài tập trực tiếp.  
- 👩‍💻 **Admin**: quản lý người dùng, giám sát hệ thống.  

👉 **Mục tiêu dự án**: xây dựng một nền tảng học tập hiện đại, dễ sử dụng, có thể mở rộng trong thực tế.  

---

## 🚀 Công nghệ sử dụng  
- **Frontend**: ReactJS (Vite, TailwindCSS, Bootstrap, React Router, Redux)  
- **Backend**: Node.js (ExpressJS)  
- **Database**: MongoDB (Mongoose)  
- **Authentication**: JWT  
- **Công cụ hỗ trợ**: Postman (API test), GitHub (version control), Excel (test case)  

---

## ✨ Các chức năng chính  
- 🔑 **Người dùng (User)**: Đăng ký, đăng nhập, chỉnh sửa thông tin cá nhân.  
- 👩‍🎓 **Học sinh (Student)**: Tham gia lớp học, xem bài giảng, làm & nộp bài tập.  
- 👨‍🏫 **Giáo viên (Teacher)**: Tạo lớp học, quản lý học sinh, đăng tải/chỉnh sửa/xóa bài giảng & bài tập, chấm điểm.  
- 🏫 **Quản lý lớp học**: Mời học sinh, xóa học sinh, tạo & xóa lớp.  
- 📂 **Quản lý tài liệu**: Đăng tải và quản lý tài liệu qua liên kết Google Drive.  

---

## 📂 Cấu trúc dự án  

```
DuAnTTSC/
│── backend/                    # API server (Node.js, Express, MongoDB)
│   │── src/
│   │   │── config/             # Cấu hình kết nối DB, JWT, middleware
│   │   │── controllers/        # Xử lý logic cho từng API (user, class, lesson, exercise)
│   │   │── models/             # Định nghĩa schema Mongoose (User, Class, Lesson, Exercise, Submission)
│   │   │── routes/             # Khai báo API endpoints
│   │   │── utils/              # Hàm tiện ích, validate, helper
│   │   └── app.js              # Khởi tạo ứng dụng Express
│   │── package.json
│   └── README.md
│
│── frontend/                   # Giao diện người dùng (ReactJS + Vite)
│   │── public/                 # File tĩnh (favicon, index.html)
│   │── src/
│   │   │── assets/             # Hình ảnh, CSS global
│   │   │── components/         # Các component tái sử dụng (Navbar, Sidebar, Button…)
│   │   │── pages/              # Trang chính (Login, Dashboard, ClassDetail, ExerciseDetail…)
│   │   │── redux/              # Quản lý state với Redux Toolkit
│   │   │── services/           # Gọi API tới backend (axios)
│   │   │── App.jsx             # Cấu hình router & layout
│   │   └── main.jsx            # Entry point React
│   │── package.json
│   └── README.md
│
│── .gitignore                  # File bỏ qua khi commit Git
│── README.md                   # Tài liệu mô tả dự án (file bạn đang đọc)
└── package.json (nếu có root config)
```

---

## ⚙️ Cài đặt & Chạy dự án  

### 1. Clone repo
```bash
git clone https://github.com/hangrey19/DuAnTTSC.git
cd DuAnTTSC
```
### 2. Backend (Node.js + Express)
```bash
Sao chép mã
cd backend
npm install
npm start
```
👉 Server chạy tại: http://localhost:5000

### 3. Frontend (ReactJS + Vite)
```bash
Sao chép mã
cd frontend
npm install
npm run dev
```
👉 Giao diện chạy tại: http://localhost:5173


---

## 🧪 Kiểm thử

- ✅ Kiểm thử API với Postman (đăng ký, đăng nhập, CRUD lớp học, bài giảng, bài tập).
- ✅ Quản lý test case bằng Excel.
- ✅ Kiểm thử giao diện thủ công (manual test) cho từng role: học sinh, giáo viên, admin.


---

## 📌 Kết quả

- 🚀 Hoàn thành hệ thống với các tính năng chính: quản lý lớp học, bài giảng, bài tập và nộp bài.
- ⚡ Tối ưu hiệu suất backend (giảm query không cần thiết) và frontend (cải thiện tốc độ tải).
