'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reducer = exports.actions = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (_config) {
  Object.assign(config, _config);
};

exports.authOnServer = authOnServer;
exports.OAuth2Component = OAuth2Component;
exports.OAuthSignout = OAuthSignout;
exports.OAuthSignin = OAuthSignin;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _reactRedux = require('react-redux');

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _reactCookie = require('react-cookie');

var _reactCookie2 = _interopRequireDefault(_reactCookie);

var _cookie = require('cookie');

var _cookie2 = _interopRequireDefault(_cookie);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = {
  url: 'http://localhost',
  token: '/oauth/token',
  providers: {
    github: '/auth/github'
  }
};

function fetch_user(token) {
  return _axios2.default.get('' + config.url + config.token, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
}

function authOnServer(cookies, store, options) {
  return new Promise(function (resolve, reject) {
    try {
      cookies = _cookie2.default.parse(cookies);
      var redux_oauth2 = JSON.parse(decodeURIComponent(cookies.redux_oauth2));
      fetch_user(redux_oauth2.access_token).then(function (res) {
        return resolve(store.dispatch(actions.load_user(res.data)));
      }).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

var actions = exports.actions = {
  cancel: function cancel() {
    return {
      type: 'OAUTH_CANCELED'
    };
  },
  error: function error(_error) {
    return {
      type: 'OAUTH_ERROR',
      payload: _error
    };
  },
  start: function start() {
    return {
      type: 'OAUTH_START'
    };
  },
  load_user: function load_user(user) {
    return {
      type: 'OAUTH_LOAD_USER',
      payload: user
    };
  },
  complete: function complete(token, cb) {
    return function (dispatch) {
      // save token
      dispatch(actions.save_token(token));
      // sync user
      dispatch(actions.sync_user(token.access_token, cb));
      dispatch({ type: 'OAUTH_COMPLETE' });
    };
  },
  save_token: function save_token(token) {
    _reactCookie2.default.save('redux_oauth2', JSON.stringify(token));
    return {
      type: 'OAUTH_SAVE_TOKEN',
      payload: token
    };
  },
  signout: function signout() {
    return function (dispatch) {
      try {
        var token = _reactCookie2.default.load('redux_oauth2');
        _axios2.default.delete('' + config.url + config.token, {
          headers: {
            'Authorization': 'Bearer ' + token.access_token
          }
        }).then(function (res) {
          _reactCookie2.default.remove('redux_oauth2');
          dispatch({
            type: 'OAUTH_SIGNOUT'
          });
        }).catch(function (e) {
          return dispatch(actions.error(e));
        });
      } catch (e) {
        dispatch(actions.error(e));
      }
    };
  },
  sync_user: function sync_user(token, cb) {
    return function (dispatch) {
      fetch_user(token).then(function (res) {
        dispatch(actions.load_user(res.data));
        cb(res.data);
      }).catch(actions.error);
    };
  }
};

var reducer = exports.reducer = {
  oauth: function oauth() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? { authenticating: false, user: null, error: null } : arguments[0];
    var actions = arguments[1];

    switch (actions.type) {
      case 'OAUTH_START':
        return { authenticating: true, user: null, error: null };
        break;
      case 'OAUTH_CANCELED':
        return { authenticating: false, user: null, error: 'user canceled' };
      case 'OAUTH_ERROR':
        return { authenticating: false, user: null, error: actions.payload };
        break;
      case 'OAUTH_LOAD_USER':
        return { authenticating: false, user: actions.payload, error: null };
        break;
      case 'OAUTH_SIGNOUT':
        return { authenticating: false, user: null, error: null };
        break;
      default:
        return state;
    }
  }
};

function OAuth2Component(Component) {
  return (0, _reactRedux.connect)(function (state) {
    return { oauth: state.oauth };
  }, function (dispatch) {
    return { oauth_actions: (0, _redux.bindActionCreators)(actions, dispatch) };
  })(function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        var auth_info = _reactCookie2.default.load('redux_oauth2');
        if (this.props.oauth.user === null && auth_info && auth_info.access_token) {
          this.props.oauth_actions.sync_user(auth_info.access_token);
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _props = this.props;
        var oauth = _props.oauth;
        var oauth_actions = _props.oauth_actions;

        var rest = _objectWithoutProperties(_props, ['oauth', 'oauth_actions']);

        var props = Object.assign({}, rest);
        return _react2.default.createElement(Component, props);
      }
    }]);

    return _class;
  }(_react2.default.Component));
}

function OAuthSignout(Button) {
  var _class2, _temp;

  return (0, _reactRedux.connect)(function (state) {
    return { oauth: state.oauth };
  }, function (dispatch) {
    return { actions: (0, _redux.bindActionCreators)(actions, dispatch) };
  })((_temp = _class2 = function (_React$Component2) {
    _inherits(_class2, _React$Component2);

    function _class2() {
      _classCallCheck(this, _class2);

      return _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).apply(this, arguments));
    }

    _createClass(_class2, [{
      key: 'handleClick',
      value: function handleClick() {
        this.props.actions.signout();
      }
    }, {
      key: 'render',
      value: function render() {
        var _this3 = this;

        var _props2 = this.props;
        var oauth = _props2.oauth;
        var dispatch = _props2.dispatch;
        var actions = _props2.actions;

        var rest = _objectWithoutProperties(_props2, ['oauth', 'dispatch', 'actions']);

        var props = Object.assign({}, rest);
        props.disabled = !(oauth.authenticating || oauth.user !== null);
        props.onClick = _lodash2.default.wrap(props.onClick, function (func, e) {
          _this3.handleClick(e);
          return func(e);
        });
        return _react2.default.createElement(Button, props);
      }
    }]);

    return _class2;
  }(_react2.default.Component), _class2.defaultProps = {
    onClick: function onClick() {}
  }, _temp));
}
function OAuthSignin(Button) {
  var _class3, _temp2;

  return (0, _reactRedux.connect)(function (state) {
    return { oauth: state.oauth };
  }, function (dispatch) {
    return { actions: (0, _redux.bindActionCreators)(actions, dispatch) };
  })((_temp2 = _class3 = function (_React$Component3) {
    _inherits(_class3, _React$Component3);

    function _class3() {
      _classCallCheck(this, _class3);

      return _possibleConstructorReturn(this, (_class3.__proto__ || Object.getPrototypeOf(_class3)).apply(this, arguments));
    }

    _createClass(_class3, [{
      key: 'handleClick',
      value: function handleClick(e, provider) {
        var url = '' + config.url + config.providers[provider];
        var name = 'connecting to ' + provider;
        var settings = 'scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no,top=100,left=100,width=600,height=500';
        this.props.actions.start();
        var popup = window.open(url, name, settings);
        this.listenPopup(popup);
      }
    }, {
      key: 'listenPopup',
      value: function listenPopup(popup) {
        if (popup.closed) {
          this.props.actions.cancel();
          this.props.onCancel();
          // dispatch auth canceled
        } else {
          var token = void 0;
          try {
            token = _queryString2.default.parse(popup.location.search.substr(1));
          } catch (e) {}
          if (token && token.access_token) {
            // 同步用户信息
            this.props.actions.complete(token, this.props.onSuccess);
            popup.close();
          } else {
            setTimeout(this.listenPopup.bind(this, popup), 0);
          }
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var _this5 = this;

        var _props3 = this.props;
        var oauth = _props3.oauth;
        var dispatch = _props3.dispatch;
        var actions = _props3.actions;
        var provider = _props3.provider;
        var onCancel = _props3.onCancel;
        var onSuccess = _props3.onSuccess;
        var onFailed = _props3.onFailed;

        var rest = _objectWithoutProperties(_props3, ['oauth', 'dispatch', 'actions', 'provider', 'onCancel', 'onSuccess', 'onFailed']);

        var props = Object.assign({}, rest);
        props.disabled = oauth.authenticating || oauth.user !== null;
        props.onClick = _lodash2.default.wrap(props.onClick, function (func, e) {
          _this5.handleClick(e, provider);
          return func(e);
        });
        return _react2.default.createElement(Button, props);
      }
    }]);

    return _class3;
  }(_react2.default.Component), _class3.defaultProps = {
    onClick: function onClick() {},
    onCancel: function onCancel() {},
    onSuccess: function onSuccess() {},
    onFailed: function onFailed() {}
  }, _temp2));
}