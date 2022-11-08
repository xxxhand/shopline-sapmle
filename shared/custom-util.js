const _NUMS = '0123456789';

function _generateRandomValues(len, chars) {
	const buf = [];
	for (let i = 0; i < len; i++) {
		buf.push(chars[Math.floor(Math.random() * chars.length)]);
	}
	return buf.join('');
}

exports.CustomUtil = class {
  static generateRandomNumbers = (len) => {
    return _generateRandomValues(len, _NUMS);
  }
}
