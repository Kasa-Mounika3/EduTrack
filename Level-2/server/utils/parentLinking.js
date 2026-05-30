const Parent = require('../models/Parent');
const Student = require('../models/Student');
const User = require('../models/User');

const buildParentPassword = (parentName) => {
  const firstName = (parentName || 'parent').trim().split(/\s+/)[0].toLowerCase();
  return `${firstName}@12345`;
};

const linkStudentToParent = async ({ student, parentName, parentEmail, parentPhone, createdBy }) => {
  if (!student || !parentEmail) return null;

  const email = parentEmail.toLowerCase().trim();
  const finalParentName = parentName || `${student.studentName || student.name || 'Student'} Parent`;
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: finalParentName,
      email,
      password: buildParentPassword(finalParentName),
      role: 'parent'
    });
    console.log(`[EduTrack] User created for parent: ${email}`);
  } else {
    console.log(`[EduTrack] Reusing existing parent user: ${email}`);
  }

  let parent = await Parent.findOne({ email });

  if (!parent) {
    parent = await Parent.create({
      parentName: finalParentName,
      name: finalParentName,
      email,
      phone: parentPhone || '',
      childId: student._id,
      linkedStudents: [student._id],
      user: user._id,
      createdBy: createdBy || student.createdBy || user._id
    });
    console.log(`[EduTrack] Parent profile created and linked: ${email}`);
  } else {
    parent.parentName = parent.parentName || finalParentName;
    parent.name = parent.name || finalParentName;
    parent.phone = parent.phone || parentPhone || '';
    parent.user = parent.user || user._id;
    parent.childId = parent.childId || student._id;
    parent.linkedStudents = Array.from(new Set([...(parent.linkedStudents || []).map(String), String(student._id)]));
    await parent.save();
    console.log(`[EduTrack] Existing parent profile linked to student: ${email}`);
  }

  await Student.findByIdAndUpdate(student._id, {
    $set: {
      parentId: parent._id,
      parentName: finalParentName,
      parentEmail: email,
      parentPhone: parentPhone || student.parentPhone || ''
    }
  });

  return parent;
};

module.exports = {
  linkStudentToParent
};
