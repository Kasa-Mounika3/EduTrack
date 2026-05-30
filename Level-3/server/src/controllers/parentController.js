const Parent = require('../models/Parent');
const Student = require('../models/Student');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { createRoleAccount } = require('../utils/accountProvisioning');
const { getPagination, getPaginationMeta } = require('../utils/queryFeatures');
const { getUploadedProfilePath } = require('../middleware/uploadMiddleware');

const buildParentQuery = ({ search }) => {
  if (!search) return {};

  return {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { parentName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  };
};

const getParents = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') {
    const users = await User.find({ role: 'parent' }).select('_id name email phone profilePhoto');
    await Promise.all(users.map((user) => Parent.findOneAndUpdate(
      { email: user.email },
      {
        $setOnInsert: {
          name: user.name,
          parentName: user.name,
          profilePhoto: user.profilePhoto || '',
          email: user.email,
          phone: user.phone || '',
          relationship: 'Guardian',
          children: [],
          linkedStudents: [],
          userAccount: user._id,
          createdBy: user._id
        },
      },
      { upsert: true, new: true, runValidators: true }
    )));
    await Promise.all(users.map((user) => Parent.updateOne(
      { email: user.email, $or: [{ userAccount: { $exists: false } }, { userAccount: null }] },
      { $set: { userAccount: user._id } }
    )));
  }

  const { page, limit, skip } = getPagination(req.query);
  await Parent.updateMany(
    { $or: [{ name: { $exists: false } }, { name: '' }, { name: null }], parentName: { $exists: true, $nin: ['', null] } },
    [{ $set: { name: '$parentName' } }]
  );
  await Parent.updateMany(
    { $or: [{ parentName: { $exists: false } }, { parentName: '' }, { parentName: null }], name: { $exists: true, $nin: ['', null] } },
    [{ $set: { parentName: '$name' } }]
  );
  await Parent.updateMany(
    { childId: { $exists: true, $ne: null }, $or: [{ children: { $exists: false } }, { children: { $size: 0 } }] },
    [{ $set: { children: ['$childId'], linkedStudents: ['$childId'] } }]
  );
  const query = buildParentQuery(req.query);

  const [parents, total] = await Promise.all([
    Parent.find(query)
      .populate('children', 'studentName email attendance marks')
      .populate('linkedStudents', 'studentName email attendance marks')
      .populate('childId', 'studentName email attendance marks')
      .populate('userAccount', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Parent.countDocuments(query)
  ]);

  sendSuccess(res, 200, 'Parents fetched successfully', parents, getPaginationMeta(total, page, limit));
});

const createParent = asyncHandler(async (req, res) => {
  const account = await createRoleAccount({
    name: req.body.name,
    email: req.body.email,
    role: 'parent',
    password: req.body.password
  });
  if (account.user.role !== 'parent') {
    await User.updateOne({ _id: account.user._id }, { role: 'parent' });
    account.user.role = 'parent';
  }

  const parent = await Parent.create({
    name: req.body.name,
    parentName: req.body.parentName || req.body.name,
    profilePhoto: getUploadedProfilePath(req) || '',
    email: req.body.email,
    phone: req.body.phone,
    relationship: req.body.relationship,
    children: req.body.children || [],
    childId: req.body.childId || req.body.children?.[0],
    linkedStudents: req.body.linkedStudents || req.body.children || [],
    userAccount: account.user._id,
    createdBy: req.user._id
  });

  if (parent.children?.length) {
    await Student.updateMany(
      { _id: { $in: parent.children } },
      { parent: parent._id, parentEmail: parent.email, parentName: parent.name, parentPhone: parent.phone }
    );
  }

  req.app.get('io')?.to('announcements').emit('dashboardUpdate', {
    type: 'parent:create',
    parent
  });

  sendSuccess(res, 201, 'Parent added successfully', {
    parent,
    temporaryPassword: account.temporaryPassword
  });
});

const updateParent = asyncHandler(async (req, res) => {
  if (req.body.name && !req.body.parentName) req.body.parentName = req.body.name;
  if (req.body.parentName && !req.body.name) req.body.name = req.body.parentName;
  const updates = {
    ...req.body,
    profilePhoto: req.body.removeProfilePhoto === 'true' ? '' : getUploadedProfilePath(req)
  };
  if (updates.profilePhoto === undefined) delete updates.profilePhoto;

  const parent = await Parent.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate('children linkedStudents childId', 'studentName email attendance marks');

  if (!parent) {
    res.status(404);
    throw new Error('Parent not found');
  }

  sendSuccess(res, 200, 'Parent updated successfully', parent);
});

const deleteParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id);

  if (!parent) {
    res.status(404);
    throw new Error('Parent not found');
  }

  await parent.deleteOne();
  if (parent.userAccount) {
    await User.findByIdAndDelete(parent.userAccount);
  }
  await Student.updateMany({ parent: parent._id }, { $unset: { parent: '', parentEmail: '', parentName: '', parentPhone: '' } });
  req.app.get('io')?.to('announcements').emit('dashboardUpdate', {
    type: 'parent:delete',
    parentId: req.params.id
  });
  sendSuccess(res, 200, 'Parent removed successfully');
});

module.exports = {
  getParents,
  createParent,
  updateParent,
  deleteParent
};
