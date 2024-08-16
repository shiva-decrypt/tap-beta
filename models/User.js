import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    default: 0,
  },
  username: {
    type: String,
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String
  },
  password: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    default: 0
  },
  levelIndex: {
    type: Number,
    default: 0
  },
  energy: {
    type: Number,
    default: 250
  },
  energyCapacity: {
    type: Number,
    default: 250
  },
  boostTimestamp: {
    type: Number,
    default: null
  },
  multiplyTimestamp: {
    type: Number,
    default: null
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  invitedFriends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  referralPoints: {
    type: Number,
    default: 0,
  },
  isFollowed: {
    type: Boolean,
    default: false,
  },
  joinTgChannel: {
    type: Boolean,
    default: false,
  },
  subscribeYouTube: {
    type: Boolean,
    default: false,
  },
  likeRetweet: {
    type: Boolean,
    default: false,
  },
  completedTasks: {
    type: [String],
    default: [],
  },
  lastLogin: {
    type: Date,
  },
  lastEnergyUpdate: {
    type: Date,
    default: Date.now,
  },
  deduction: {
    type: Number,
    default: 0
  },
  multitap: {
    type: Number,
    default: 1,
  },
  multitapArray: {
    type: [Boolean],
    default: () => Array(6).fill(false)
  },
  energyLimitArray: {
    type: [Boolean],
    default: () => Array(6).fill(false)
  },
  referralTasks: {
    invite3Friends: { type: Boolean, default: false },
    invite10Friends: { type: Boolean, default: false },
    invite15Friends: { type: Boolean, default: false },
  },
});

const User = mongoose.model('User', userSchema);
userSchema.index({ id: 1 })
userSchema.index({ referralCode: 1 })

export default User;
