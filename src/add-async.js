module.exports = (list) => {
  const addAsync = (values, callback, items) => {
    const valuesToAdd = values.splice(0, 50);
    let itms = items || [];
    itms = itms.concat(list.add(valuesToAdd));
    if (values.length > 0) {
      setTimeout(() => {
        addAsync(values, callback, itms);
      }, 1);
    } else {
      list.update();
      callback(itms);
    }
  };
  return addAsync;
};
