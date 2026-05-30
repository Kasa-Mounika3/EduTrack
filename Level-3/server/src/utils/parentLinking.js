const Parent = require('../models/Parent');
const Student = require('../models/Student');
const { createRoleAccount } = require('./accountProvisioning');

const linkStudentToParent = async ({ student, parentName, parentEmail, parentPhone, relationship, createdBy }) => {
  if (!student || !parentEmail) return null;

  const email = parentEmail.toLowerCase().trim();
  const finalParentName = parentName || `${student.studentName || student.name || 'Student'} Parent`;
  const account = await createRoleAccount({
    name: finalParentName,
    email,
    role: 'parent'
  });

  let parent = await Parent.findOne({ email });

  if (!parent) {
    parent = await Parent.create({
      name: finalParentName,
      parentName: finalParentName,
      email,
      phone: parentPhone || '',
      relationship: relationship || 'Guardian',
      children: [student._id],
      childId: student._id,
      linkedStudents: [student._id],
      userAccount: account.user._id,
      createdBy: createdBy || student.createdBy || account.user._id
    });
    console.log(`[EduTrack] Parent profile created and linked: ${email}`);
  } else {
    parent.name = parent.name || finalParentName;
    parent.parentName = parent.parentName || finalParentName;
    parent.phone = parent.phone || parentPhone || '';
    parent.relationship = parent.relationship || relationship || 'Guardian';
    parent.userAccount = parent.userAccount || account.user._id;
    parent.children = Array.from(new Set([...(parent.children || []).map(String), String(student._id)]));
    parent.childId = parent.childId || student._id;
    parent.linkedStudents = Array.from(new Set([...(parent.linkedStudents || []).map(String), String(student._id)]));
    await parent.save();
    console.log(`[EduTrack] Existing parent profile linked to student: ${email}`);
  }

  await Student.findByIdAndUpdate(student._id, {
    $set: {
      parent: parent._id,
      parentName: finalParentName,
      parentEmail: email,
      parentPhone: parentPhone || student.parentPhone || '',
      parentRelationship: relationship || student.parentRelationship || 'Guardian'
    }
  });

  return parent;
};

module.exports = {
  linkStudentToParent
};
