var sanitizeHtml = require('sanitize-html');

module.exports = function(dirty) {
  var clean = sanitizeHtml(dirty, {
    allowTags: ['br', 'span', 'strong', 'b', 'i', 'a', 'h3', 'h4', 'h5', 'ul', 'li'],
    allowAttributes: {
      'a': ['href'],
    }
  });
  return clean;
}
