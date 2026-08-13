const Restaurant = require('../models/Restaurant');

// Convert name to slug
function generateSlugFromName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 50); // Limit to 50 chars
}

// Generate unique slug
async function generateUniqueSlug(name) {
  let slug = generateSlugFromName(name);
  let baseSlug = slug;
  let counter = 1;

  // Keep adding number until unique
  while (await Restaurant.slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = {
  generateSlugFromName,
  generateUniqueSlug
};
