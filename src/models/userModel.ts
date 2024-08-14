import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  username: string;
  password: string;
  role: 'Sysadmin' | 'Staff' | 'User';
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['Sysadmin', 'Staff', 'User'],
    default: 'User',
  },
});

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword: string, userPassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
