const Feedback = require('../models/Feedback');

// Submit new canteen feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, category, comment } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const feedback = new Feedback({
      user: req.user.id,
      rating: numRating,
      category: category || 'general',
      comment: comment.trim(),
    });

    await feedback.save();
    await feedback.populate('user', 'name email');

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
};

// Get all feedback (admin)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const total = feedbacks.length;
    const avgRating = total > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1)
      : 5.0;

    res.json({
      total,
      avgRating: Number(avgRating),
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};
