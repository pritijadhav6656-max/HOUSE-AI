const Contact = require('../models/Contact');

const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting HOUSE AI. Your inquiry has been recorded.',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const listContactsAdmin = async (req, res, next) => {
  try {
    const { search = '', status = '', page = 1, limit = 15 } = req.query;
    const filter = {};

    if (status === 'pending' || status === 'resolved') {
      filter.status = status;
    }
    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [total, contacts] = await Promise.all([
      Contact.countDocuments(filter),
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

const updateContactStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'pending' or 'resolved'.",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry marked as ${status}.`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const deleteContactAdmin = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.',
      });
    }

    await contact.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'Contact message deleted.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  listContactsAdmin,
  updateContactStatusAdmin,
  deleteContactAdmin,
};
