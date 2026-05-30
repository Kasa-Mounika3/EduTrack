const Parent = require('../models/Parent');
const Student = require('../models/Student');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { getUploadedProfilePath } = require('../middleware/uploadMiddleware');

const buildParentPassword = (parentName) => {
  const firstName = (parentName || 'parent').trim().split(/\s+/)[0].toLowerCase();
  return `${firstName}@12345`;
};

const syncRegisteredParents = async () => {
  const users = await User.find({ role: 'parent' }).select('_id name email phone');
  await Promise.all(users.map((user) => Parent.findOneAndUpdate(
    { email: user.email },
    {
      $setOnInsert: {
        parentName: user.name,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        linkedStudents: [],
        user: user._id,
        createdBy: user._id
      },
    },
    { upsert: true, new: true, runValidators: true }
  )));
  await Promise.all(users.map((user) => Parent.updateOne(
    { email: user.email, $or: [{ user: { $exists: false } }, { user: null }] },
    { $set: { user: user._id } }
  )));
};

const getParents = asyncHandler(async (req, res) => {
  await syncRegisteredParents();
  await Parent.updateMany(
    { $or: [{ parentName: { $exists: false } }, { parentName: '' }, { parentName: null }], name: { $exists: true, $nin: ['', null] } },
    [{ $set: { parentName: '$name' } }]
  );
  await Parent.updateMany(
    { $or: [{ name: { $exists: false } }, { name: '' }, { name: null }], parentName: { $exists: true, $nin: ['', null] } },
    [{ $set: { name: '$parentName' } }]
  );
  const parents = await Parent.find()
    .populate('childId', 'studentName email attendance marks courseProgress')
    .populate('linkedStudents', 'studentName email attendance marks courseProgress')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  sendSuccess(res, 200, 'Parents fetched successfully', parents, { total: parents.length });
});

const createParent = asyncHandler(async (req, res) => {
  const { parentName, name, email, phone, childId, linkedStudents = [], password } = req.body;
  const finalParentName = parentName || name;
  const studentLinks = linkedStudents.length ? linkedStudents : [childId].filter(Boolean);

  if (!finalParentName || !email) {
    res.status(400);
    throw new Error('Parent name and email are required');
  }

  if (studentLinks.length && await Student.countDocuments({ _id: { $in: studentLinks } }) !== studentLinks.length) {
    res.status(404);
    throw new Error('Child student not found');
  }

  if (await Parent.exists({ email })) {
    res.status(409);
    throw new Error('A parent already exists with this email');
  }

  const temporaryPassword = password || buildParentPassword(finalParentName);
  let parentUser = await User.findOne({ email });
  let parentUserCreated = false;
  if (!parentUser) {
    parentUser = await User.create({
      name: finalParentName,
      email,
      password: temporaryPassword,
      role: 'parent'
    });
    parentUserCreated = true;
    console.log(`[EduTrack] User created for parent: ${email}`);
  } else {
    console.log(`[EduTrack] Reusing existing parent user: ${email}`);
  }
  if (parentUser.role !== 'parent') {
    await User.updateOne({ _id: parentUser._id }, { role: 'parent' });
    parentUser.role = 'parent';
  }

  try {
    const parent = await Parent.create({
      parentName: finalParentName,
      name: finalParentName,
      profilePhoto: getUploadedProfilePath(req) || '',
      email,
      phone,
      childId: studentLinks[0],
      linkedStudents: studentLinks,
      user: parentUser._id,
      createdBy: req.user._id
    });

    if (studentLinks.length) {
      await Student.updateMany({ _id: { $in: studentLinks } }, {
        $set: {
          parentId: parent._id,
          parentEmail: email,
          parentName: finalParentName,
          parentPhone: phone || ''
        }
      });
    }
    console.log(`[EduTrack] Parent profile created: ${email}`);

    const populatedParent = await parent.populate([
      { path: 'childId', select: 'studentName email attendance marks courseProgress' },
      { path: 'linkedStudents', select: 'studentName email attendance marks courseProgress' },
      { path: 'user', select: 'name email role' }
    ]);

    sendSuccess(res, 201, 'Parent profile and login account created successfully', {
      parent: populatedParent,
      loginCredentials: {
        email,
        temporaryPassword
      }
    });
  } catch (error) {
    if (parentUserCreated) {
      await User.findByIdAndDelete(parentUser._id);
      console.log(`[EduTrack] Rolled back parent user after profile creation failed: ${email}`);
    }
    throw error;
  }
});

const updateParent = asyncHandler(async (req, res) => {
  const { parentName, name, phone, childId, linkedStudents } = req.body;
  const studentLinks = linkedStudents?.length ? linkedStudents : childId ? [childId] : undefined;
  const updates = {
    parentName: parentName || name,
    name: parentName || name,
    profilePhoto: req.body.removeProfilePhoto === 'true' ? '' : getUploadedProfilePath(req),
    phone,
    childId: studentLinks?.[0],
    linkedStudents: studentLinks
  };

  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const parent = await Parent.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate('childId', 'studentName email attendance marks courseProgress').populate('linkedStudents', 'studentName email attendance marks courseProgress');

  if (!parent) {
    res.status(404);
    throw new Error('Parent not found');
  }

  if (studentLinks) {
    await Student.updateMany({ parentId: parent._id }, { $unset: { parentId: '' } });
    await Student.updateMany({ _id: { $in: studentLinks } }, { $set: { parentId: parent._id } });
  }

  sendSuccess(res, 200, 'Parent updated successfully', parent);
});

const deleteParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id);

  if (!parent) {
    res.status(404);
    throw new Error('Parent not found');
  }

  await Promise.all([
    Parent.findByIdAndDelete(parent._id),
    User.findByIdAndDelete(parent.user),
    Student.updateMany({ parentId: parent._id }, { $unset: { parentId: '' } })
  ]);

  sendSuccess(res, 200, 'Parent deleted successfully');
});

module.exports = {
  getParents,
  createParent,
  updateParent,
  deleteParent
};
