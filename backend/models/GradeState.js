// models/GradeState.js
import mongoose from 'mongoose';

const gradeStateSchema = new mongoose.Schema({
  lineUserId: String,
  grades: Object, // Store grade details for comparison
},{timestamps:true}
);

export default mongoose.models.GradeState || mongoose.model('GradeState', gradeStateSchema);
