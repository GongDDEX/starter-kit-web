import { signOrder } from '../lib/web3';
import api from '../lib/api';

export const TRADE_FORM_ID = 'TRADE';

export const trade = (side, price, amount, orderType = 'limit', expires = 86400 * 365 * 1000) => {
  return async (dispatch, getState) => {
    try {
      const result = await dispatch(createOrder(side, price, amount, orderType, expires));
      if (result.status === 0) {
        alert('Successfully created order');
        return true;
      } else {
        alert(result.desc);
      }
    } catch (e) {
      alert(e);
    }
    return false;
  };
};

const createOrder = (side, price, amount, orderType, expires) => {
  return async (dispatch, getState) => {
    const state = getState();
    const address = state.account.get('address');
    const currentMarket = state.market.getIn(['markets', 'currentMarket']);

    const buildOrderResponse = await api.post('/orders/build', {
      amount,
      price,
      side,
      expires,
      orderType,
      marketId: currentMarket.id
    });

    if (buildOrderResponse.data.status !== 0) {
      return buildOrderResponse.data;
    }
    const orderParams = buildOrderResponse.data.data.order;
    const { id: orderId, json: order } = orderParams;
    try {
      const signature = await signOrder(address, order);
      const placeOrderResponse = await api.post('/orders', {
        orderId,
        signature,
        method: 1
      });

      return placeOrderResponse.data;
    } catch (e) {
      alert(e);
    }
  };
};

export const tradeUpdate = trade => {
  return {
    type: 'TRADE_UPDATE',
    payload: {
      trade
    }
  };
};

export const marketTrade = trade => {
  return {
    type: 'MARKET_TRADE',
    payload: {
      trade
    }
  };
};