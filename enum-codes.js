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

const _paymentTypes = {
  CREDIT: 1,
  ATM: 2,
  CVS: 3,
};

const _orderStatus = {
  UNPAID: 1,
  PAID: 2,
  CANCEL: 3,
}

module.exports = {
  collectionNames: _colNames,
  productStatus: _productStatus,
  paymentTypes: _paymentTypes,
  orderStatus: _orderStatus,
};
