var sanitizeHtml = require('sanitize-html');

module.exports = function(dirty) {
  var clean = sanitizeHtml(dirty, {
    allowTags: ['span', 'b', 'i'],
    allowAttributes: {
      'span': ['style']
    }
  });
  return clean;
}
