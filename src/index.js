import React from 'react'
import {bindActionCreators} from 'redux'
import axios from 'axios'
import { connect } from 'react-redux'
import querystring from 'query-string'
import react_cookie from 'react-cookie'
import node_cookie from 'cookie'
import _ from 'lodash'

const config = {
  url: 'http://localhost',
  token: '/oauth/token',
  providers: {
    github: '/auth/github'
  }
}

export default function (_config) {
  Object.assign(config, _config);
}

function fetch_user(token) {
  return axios.get(`${config.url}${config.token}`, {
    headers:{
      'Authorization':`Bearer ${token}`
    }
  });
}

export function authOnServer(cookies, store, options) {
  return new Promise((resolve, reject)=>{
    try {
      cookies = node_cookie.parse(cookies);
      let redux_oauth2 = JSON.parse(decodeURIComponent(cookies.redux_oauth2));
      fetch_user(redux_oauth2.access_token).then(res => resolve(store.dispatch(actions.load_user(res.data)))).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

export const actions = {
  cancel(){
    return {
      type: 'OAUTH_CANCELED'
    }
  },
  error(error){
    return {
      type: 'OAUTH_ERROR',
      payload: error,
    }
  },
  start(){
    return {
      type: 'OAUTH_START',
    }
  },
  load_user(user){
    return {
      type: 'OAUTH_LOAD_USER',
      payload: user,
    }
  },
  complete(token, cb){
    return dispatch => {
      // save token
      dispatch(actions.save_token(token));
      // sync user
      dispatch(actions.sync_user(token.access_token, cb));
      dispatch({ type: 'OAUTH_COMPLETE' });
    }
  },
  save_token(token){
    react_cookie.save('redux_oauth2', JSON.stringify(token));
    return {
      type: 'OAUTH_SAVE_TOKEN',
      payload: token
    }
  },
  signout(){
    return dispatch => {
      try {
        let token = react_cookie.load('redux_oauth2');
        axios.delete(`${config.url}${config.token}`, {
          headers:{
            'Authorization':`Bearer ${token.access_token}`
          }
        }).then(res => {
          react_cookie.remove('redux_oauth2');
          dispatch({
            type: 'OAUTH_SIGNOUT'
          })
        }).catch(e => dispatch(actions.error(e)));
      } catch (e) {
        dispatch(actions.error(e))
      }
    }
  },
  sync_user(token, cb){
    return dispatch => {
      fetch_user(token).then(res => {
        dispatch(actions.load_user(res.data))
        cb(res.data);
      }).catch(actions.error)
    }
  }
}

export const reducer = {
  oauth(state = {authenticating: false, user: null, error: null}, actions){
    switch (actions.type) {
      case 'OAUTH_START':
        return {authenticating: true, user: null, error: null}
        break;
      case 'OAUTH_CANCELED':
        return {authenticating: false, user: null, error: 'user canceled'}
      case 'OAUTH_ERROR':
        return {authenticating: false, user: null, error: actions.payload}
        break;
      case 'OAUTH_LOAD_USER':
        return {authenticating: false, user: actions.payload, error: null}
        break;
      case 'OAUTH_SIGNOUT':
        return {authenticating: false, user: null, error: null}
        break;
      default:
        return state;
    }
  }
}

export function OAuth2Component(Component) {
  return connect(state => ({oauth:state.oauth}), dispatch => ({oauth_actions:bindActionCreators(actions, dispatch)}))(
    class extends React.Component {
      componentWillMount(){
        let auth_info = react_cookie.load('redux_oauth2');
        if (this.props.oauth.user === null && auth_info && auth_info.access_token) {
          this.props.oauth_actions.sync_user(auth_info.access_token);
        }
      }
      render(){
        let {oauth, oauth_actions, ...rest} = this.props;
        let props = Object.assign({}, rest);
        return <Component {...props} />
      }
    }
  )
}

export function OAuthSignout(Button) {
  return connect(state => ({oauth:state.oauth}), dispatch => ({actions:bindActionCreators(actions, dispatch)}))(
    class extends React.Component {
      static defaultProps = {
        onClick: function(){}
      }
      handleClick(){
        this.props.actions.signout();
      }
      render(){
        let {oauth, dispatch, actions, ...rest} = this.props;
        let props = Object.assign({}, rest);
        props.disabled = !(oauth.authenticating || oauth.user !== null);
        props.onClick = _.wrap(props.onClick, (func, e)=>{
          this.handleClick(e);
          return func(e);
        });
        return <Button {...props} />
      }
    })
}
export function OAuthSignin(Button) {
  return connect(state => ({oauth:state.oauth}), dispatch => ({actions:bindActionCreators(actions, dispatch)}))(
    class extends React.Component {
      static defaultProps = {
        onClick: function(){},
        onCancel: function(){},
        onSuccess: function(){},
        onFailed: function(){}
      }
      handleClick(e, provider){
        let url = `${config.url}${config.providers[provider]}`;
        let name = 'connecting to ' + provider;
        let settings = 'scrollbars=no,toolbar=no,location=no,titlebar=no,directories=no,status=no,menubar=no,top=100,left=100,width=600,height=500';
        this.props.actions.start();
        let popup = window.open(url, name, settings);
        this.listenPopup(popup);
      }
      listenPopup(popup){
        if (popup.closed) {
          this.props.actions.cancel();
          this.props.onCancel();
          // dispatch auth canceled
        } else {
          let token;
          try {
            token = querystring.parse(popup.location.search.substr(1));
          } catch (e) { }
          if (token && token.access_token) {
            // 同步用户信息
            this.props.actions.complete(token, this.props.onSuccess);
            popup.close();
          } else {
            setTimeout(this.listenPopup.bind(this, popup), 0);
          }
        }
      }
      render(){
        let {oauth, dispatch, actions, provider, onCancel, onSuccess, onFailed, ...rest} = this.props;
        let props = Object.assign({}, rest);
        props.disabled = oauth.authenticating || oauth.user !== null;
        props.onClick = _.wrap(props.onClick, (func, e)=>{
          this.handleClick(e, provider);
          return func(e);
        });
        return <Button {...props} />
      }
    })
}
