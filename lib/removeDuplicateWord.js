module.exports = (arr) => {
  let tempArr = [];
  let newArr = arr.filter((word) => {
    if (tempArr.indexOf(word.toLowerCase()) === -1) {
      tempArr.push(word.toLowerCase());
      return true;
    }
    return false;
  });
  return newArr;
};
