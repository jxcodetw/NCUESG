var sanitizeHtml = require('sanitize-html');

module.exports = function(dirty) {
  var clean = sanitizeHtml(dirty, {
    allowTags: ['span', 'b', 'i', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'ul', 'li'],
    allowAttributes: {
      'span': ['style'],
      'a': ['href']
    }
  });
  return clean;
}
