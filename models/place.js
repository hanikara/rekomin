const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const placeSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  image: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

// delete all reviews from one place (data parent with child)
placeSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model('Place', placeSchema);
