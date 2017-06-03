const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

const data = {
  id: 10
};

const token = jwt.sign(data, 'chong');
console.log(token);
// const decode = jwt.verify(token, 'chong');
// console.log(JSON.stringify(decode,undefined,2));
// const message = 'test hashing';
// const hash = SHA256(message).toString();
// console.log(hash);