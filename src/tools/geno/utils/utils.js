const showText = (node) => {
  if (typeof node === 'object') {
    return node._;
  }
  return node;
}


export {
  showText,
}