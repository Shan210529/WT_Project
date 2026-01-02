const router = require('express').Router();
const Design = require('../models/Design');
const auth = require('../middleware/auth');

// @route   POST api/design/save
// @desc    Create or Update a design
// @access  Private
router.post('/save', auth, async (req, res) => {
  const { designId, name, roomDimensions, items } = req.body;

  try {
    let design;

    if (designId) {
      design = await Design.findById(designId);
      if (!design) return res.status(404).json({ msg: 'Design not found' });
      if (design.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

      design = await Design.findByIdAndUpdate(
        designId,
        { $set: { name, roomDimensions, items } },
        { new: true }
      );
    } else {
      design = new Design({
        user: req.user.id,
        name,
        roomDimensions,
        items
      });
      await design.save();
    }
    res.json(design);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/design/my-designs
// @desc    Get all designs for user
// @access  Private
router.get('/my-designs', auth, async (req, res) => {
  try {
    const designs = await Design.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/design/:id
// @desc    Get specific design
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ msg: 'Design not found' });
    if (design.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    res.json(design);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/design/:id
// @desc    Delete a design
// @access  Private
// --- NEW CODE STARTS HERE ---
router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);

    if (!design) {
      return res.status(404).json({ msg: 'Design not found' });
    }

    // Check user
    if (design.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Design.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Design removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// --- NEW CODE ENDS HERE ---

module.exports = router;