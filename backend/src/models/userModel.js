import mongoose from 'mongoose';


const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hashPassword: {
    type: String,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true,
    default: false
  }
},
{
  timestamps: true
});

export default mongoose.model('User', UserSchema);
