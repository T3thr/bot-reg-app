// models/GradeState.js
import mongoose from 'mongoose';

const GradeStateSchema = new mongoose.Schema({
  lineUserId: { type: String, required: true },
  grades: { type: Object, required: true },
  lastChecked: { type: Date, default: Date.now },
},{timestamps:true}
);

export default mongoose.models.GradeState || mongoose.model('GradeState', GradeStateSchema);