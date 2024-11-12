// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  password: String, // Ensure password is hashed before storing
  lineUserId: String,
},{timestamps:true}
);

export default mongoose?.models?.User || mongoose.model('User', userSchema);
