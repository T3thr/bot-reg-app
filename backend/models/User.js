// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  password: String, // Ensure password is hashed before storing
  lineUserId:{
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    default: "user",
  },
},{timestamps:true}
);

export default mongoose.models.User || mongoose.model('User', userSchema);
