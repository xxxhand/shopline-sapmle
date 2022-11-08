const _colNames = {
  ACCOUNT: 'Accounts',
  OREDR: 'Orders',
  ORDER_ITEM: 'OrderItems',
  PRODUCT: 'Products',
}

const _productStatus = {
  ONLINE: 1,
  OFFLINE: 2,
};

module.exports = {
  collectionNames: _colNames,
  productStatus: _productStatus,
};
