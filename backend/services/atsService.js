export const calculateATS = ({
  skills,
  projects,
  email,
  phone,
  linkedin,
  github
}) => {

  let score = 0;

  // Skills
  if (skills.length >= 8) score += 30;
  else if (skills.length >= 5) score += 20;
  else if (skills.length >= 3) score += 10;

  // Projects
  if (projects.length >= 3) score += 20;
  else if (projects.length >= 1) score += 10;

  // Contact
  if (email) score += 5;
  if (phone) score += 5;

  // Profiles
  if (linkedin) score += 5;
  if (github) score += 5;

  return score;
};