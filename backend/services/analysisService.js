const {
  Student,
  StudentSkill,
  JobRole,
  Skill,
  LearningResource,
  Analysis,
  Notification
} = require('../models');

/**
 * Level weight converter
 */
const levelValue = {
  none: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

/**
 * Perform comprehensive skill gap analysis for a student against a target career role
 * @param {String} studentId - Student document ID
 * @param {String} targetRoleId - Optional specific JobRole ID
 */
const runSkillGapAnalysis = async (studentId, targetRoleId = null) => {
  const student = await Student.findById(studentId).populate('user');
  if (!student) {
    throw new Error('Student not found');
  }

  // Determine target role: explicit argument -> student.targetCareerRole -> default first JobRole
  let roleId = targetRoleId || student.targetCareerRole;
  let jobRole = null;

  if (roleId) {
    jobRole = await JobRole.findById(roleId).populate('requiredSkills.skill niceToHaveSkills.skill');
  }

  if (!jobRole) {
    jobRole = await JobRole.findOne({ isActive: true }).populate('requiredSkills.skill niceToHaveSkills.skill');
  }

  if (!jobRole) {
    throw new Error('No target job role benchmark available for analysis');
  }

  // Get student's acquired skills
  const studentSkills = await StudentSkill.find({ student: studentId }).populate('skill');
  const studentSkillMap = new Map();
  studentSkills.forEach((ss) => {
    if (ss.skill) {
      studentSkillMap.set(ss.skill._id.toString(), ss);
    }
  });

  const strengths = [];
  const skillGaps = [];
  const categoryScores = {};
  const categoryBenchmarks = {};

  let totalWeightedScore = 0;
  let totalWeights = 0;

  // Evaluate required skills from Job Role
  for (const reqSkill of jobRole.requiredSkills) {
    const skillObj = reqSkill.skill;
    if (!skillObj) continue;

    const skillIdStr = skillObj._id.toString();
    const studentSkill = studentSkillMap.get(skillIdStr);

    const targetLevel = reqSkill.minProficiencyLevel || 'intermediate';
    const targetScore = reqSkill.minScore || 65;
    const weight = reqSkill.weight || 5;
    const cat = skillObj.category || 'Other';

    categoryBenchmarks[cat] = (categoryBenchmarks[cat] || 0) + weight;

    if (studentSkill) {
      const studentLevel = studentSkill.proficiencyLevel || 'beginner';
      const studentScore = studentSkill.scorePercentage || 0;

      const studentLvlVal = levelValue[studentLevel] || 1;
      const targetLvlVal = levelValue[targetLevel] || 2;

      // Contribution to total score
      const matchRatio = Math.min(studentScore / targetScore, 1.2);
      totalWeightedScore += matchRatio * weight * 100;
      totalWeights += weight;

      categoryScores[cat] = (categoryScores[cat] || 0) + matchRatio * weight;

      if (studentLvlVal >= targetLvlVal && studentScore >= targetScore) {
        strengths.push({
          skill: skillObj._id,
          proficiencyLevel: studentLevel,
          score: studentScore,
          reason: `Meets or exceeds target ${targetLevel} benchmark (${studentScore}%)`
        });
      } else {
        const gap = Math.max(0, targetScore - studentScore);
        skillGaps.push({
          skill: skillObj._id,
          targetLevel,
          currentLevel: studentLevel,
          gapPercentage: gap,
          severity: gap > 40 ? 'critical' : gap > 20 ? 'high' : 'medium',
          estimatedHoursToBridge: Math.round(gap * 0.8)
        });
      }
    } else {
      // Missing completely
      totalWeights += weight;
      const gap = targetScore;

      skillGaps.push({
        skill: skillObj._id,
        targetLevel,
        currentLevel: 'none',
        gapPercentage: gap,
        severity: reqSkill.isMandatory ? 'critical' : 'high',
        estimatedHoursToBridge: 35
      });
    }
  }

  // Calculate overall readiness percentage
  const overallReadinessScore = totalWeights > 0 ? Math.min(100, Math.round(totalWeightedScore / totalWeights)) : 0;

  // Determine status
  let readinessStatus = 'needs_foundation';
  if (overallReadinessScore >= 80) readinessStatus = 'job_ready';
  else if (overallReadinessScore >= 65) readinessStatus = 'near_ready';
  else if (overallReadinessScore >= 40) readinessStatus = 'in_progress';

  // Category breakdown
  const categoryBreakdown = Object.keys(categoryBenchmarks).map((cat) => {
    const maxB = categoryBenchmarks[cat] || 1;
    const actual = categoryScores[cat] || 0;
    return {
      category: cat,
      currentScore: Math.min(100, Math.round((actual / maxB) * 100)),
      benchmarkScore: 75
    };
  });

  // Generate automated learning recommendations for top gap skills
  const recommendations = [];
  for (const gap of skillGaps.slice(0, 4)) {
    const resource = await LearningResource.findOne({ skill: gap.skill, isActive: true });
    recommendations.push({
      type: 'study_resource',
      title: `Improve skill in ${resource ? resource.title : 'Required Skill'}`,
      description: `Bridge your ${gap.gapPercentage}% gap to achieve ${gap.targetLevel} level`,
      priority: gap.severity === 'critical' ? 'high' : 'medium',
      resourceId: resource ? resource._id : null,
      skillId: gap.skill
    });
  }

  // AI insights synthesis
  const totalHoursNeeded = skillGaps.reduce((acc, curr) => acc + (curr.estimatedHoursToBridge || 20), 0);
  const weeklyStudyHours = 12;
  const estimatedWeeks = Math.max(2, Math.ceil(totalHoursNeeded / weeklyStudyHours));

  const aiInsights = {
    summary: `Student has an overall ${overallReadinessScore}% match with the '${jobRole.title}' role. ${strengths.length} key strengths identified, with ${skillGaps.length} areas requiring attention.`,
    careerAdvice:
      overallReadinessScore >= 75
        ? 'Excellent progress! Focus on building portfolio projects and taking mock interviews.'
        : 'Prioritize critical skill gaps highlighted in the report and take targeted skill assessments.',
    estimatedTimeToJobReadinessWeeks: estimatedWeeks,
    suggestedWeeklyStudyHours: weeklyStudyHours
  };

  // Create Analysis report record
  const analysis = await Analysis.create({
    student: studentId,
    targetRole: jobRole._id,
    overallReadinessScore,
    readinessStatus,
    strengths,
    skillGaps,
    categoryBreakdown,
    recommendations,
    aiInsights
  });

  // Update student overall proficiency score
  student.overallProficiencyScore = overallReadinessScore;
  student.targetCareerRole = jobRole._id;
  await student.save();

  // Send Notification
  if (student.user) {
    await Notification.create({
      recipient: student.user._id,
      title: 'New Skill Gap Analysis Ready',
      message: `Your career match score for '${jobRole.title}' is ${overallReadinessScore}%.`,
      type: 'analysis_ready',
      link: `/analysis`
    });
  }

  // Return populated analysis
  return await Analysis.findById(analysis._id)
    .populate('targetRole', 'title category marketInsights')
    .populate('strengths.skill', 'name category icon')
    .populate('skillGaps.skill', 'name category icon')
    .populate('recommendations.resourceId', 'title url provider resourceType durationHours');
};

module.exports = { runSkillGapAnalysis };
