const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  slots: [
    {
      type: String,
      required: true,
    },
  ],
});

availabilitySchema.index({ professor: 1, date: 1 }, { unique: true });

const availabilityModel = mongoose.model('Availability', availabilitySchema);

module.exports = availabilityModel;
