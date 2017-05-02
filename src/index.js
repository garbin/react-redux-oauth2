import React from 'react'
import {bindActionCreators} from 'redux'
import axios from 'axios'
import { connect } from 'react-redux'
import querystring from 'query-string'
import reactCookie from 'react-cookie'
import nodeCookie from 'cookie'
import _ from 'lodash'

const config = {
  url: 'http://localhost',
  token: '/oauth/token',
  client_id: null,
  client_secret: null,
  providers: {
    github: '/auth/github'
  }
}

export default function (_config) {
  Object.assign(config, _config)
}

function fetchUser (token) {
  return axios.get(`${config.url}${config.token}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}

export function storeInitialize (cookies, { dispatch }, options) {
  return new Promise((resolve, reject) => {
    try {
      cookies = nodeCookie.parse(cookies)
      const { access_token: accessToken } = JSON.parse(decodeURIComponent(cookies.redux_oauth2 || '{}'))
      if (accessToken) {
        fetchUser(accessToken).then(res => resolve(dispatch(actions.loadUser(res.data)))).catch(reject)
      } else {
        resolve()
      }
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}

export const actions = {
  cancel () {
    return {
      type: 'OAUTH_CANCELED'
    }
  },
  error (error) {
    return {
      type: 'OAUTH_ERROR',
      payload: error
    }
  },
  start () {
    return {
      type: 'OAUTH_START'
    }
  },
  loadUser (user) {
    return {
      type: 'OAUTH_LOAD_USER',
      payload: user
    }
  },
  getToken (creds, cb) {
    return dispatch => {
      dispatch(actions.start())
      axios.post(`${config.url}${config.token}`, Object.assign({
        client_id: config.client_id,
        client_secret: config.client_secret,
        grant_type: 'password',
        scope: 'all'
      }, creds)).then(res => {
        dispatch(actions.complete(res.data, () => {
          cb(null, res.data)
        }))
      }).catch(e => {
        cb(e)
        dispatch(actions.error(e))
      })
    }
  },
  complete (token, cb) {
    return dispatch => {
      // save token
      dispatch(actions.saveToken(token))
      // sync user
      dispatch(actions.syncUser(token.access_token, cb))
      dispatch({ type: 'OAUTH_COMPLETE' })
    }
  },
  saveToken (token) {
    reactCookie.save('redux_oauth2', JSON.stringify(token), {path: '/'})
    return {
      type: 'OAUTH_SAVE_TOKEN',
      payload: token
    }
  },
  signout () {
    return dispatch => {
      try {
        let token = reactCookie.load('redux_oauth2')
        axios.delete(`${config.url}${config.token}`, {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        }).then(res => {
          reactCookie.remove('redux_oauth2')
          dispatch({
            type: 'OAUTH_SIGNOUT'
          })
        }).catch(e => dispatch(actions.error(e)))
      } catch (e) {
        dispatch(actions.error(e))
      }
    }
  },
  syncUser (token, cb) {
    return dispatch => {
      fetchUser(token).then(res => {
        dispatch(actions.loadUser(res.data))
        cb(res.data)
      }).catch(actions.error)
    }
  }
}

export const reducer = (state = {authenticating: false, user: null, error: null}, actions) => {
  switch (actions.type) {
    case 'OAUTH_START':
      return {authenticating: true, user: null, error: null}
    case 'OAUTH_CANCELED':
      return {authenticating: false, user: null, error: 'user canceled'}
    case 'OAUTH_ERROR':
      return {authenticating: false, user: null, error: actions.payload}
    case 'OAUTH_LOAD_USER':
      return {authenticating: false, user: actions.payload, error: null}
    case 'OAUTH_SIGNOUT':
      return {authenticating: false, user: null, error: null}
    default:
      return state
  }
}

export function OAuthSignout (Button) {
  return connect(state => ({oauth: state.oauth}), dispatch => ({actions: bindActionCreators(actions, dispatch)}))(
    class extends React.Component {
      static get defaultProps () {
        return {
          onClick () {}
        }
      }
      handleClick () {
        this.props.actions.signout()
      }
      render () {
        const {oauth, dispatch, actions, ...rest} = this.props
        const props = Object.assign({}, rest)
        props.disabled = !(oauth.authenticating || oauth.user !== null)
        props.onClick = _.wrap(props.onClick, (func, e) => {
          this.handleClick(e)
          return func(e)
        })
        return <Button {...props} />
      }
    })
}
export function OAuthSignin (Button, popupSetting) {
  return connect(state => ({oauth: state.oauth}), dispatch => ({actions: bindActionCreators(actions, dispatch)}))(
    class extends React.Component {
      static get defaultProps () {
        return {
          onClick () {},
          onCancel () {},
          onSuccess () {},
          onFailed () {}
        }
      }
      handleClick (e, provider) {
        const url = `${config.url}${config.providers[provider]}`
        const name = 'connecting to ' + provider
        const settings = Object.assign({
          scrollbars: 'no',
          toolbar: 'no',
          location: 'no',
          titlebar: 'no',
          directories: 'no',
          status: 'no',
          menubar: 'no',
          top: '100',
          left: '100',
          width: '600',
          height: '500'
        }, popupSetting || {})
        this.props.actions.start()
        const popup = window.open(url, name, querystring.stringify(settings).replace(/&/g, ','))
        this.listenPopup(popup)
      }
      listenPopup (popup) {
        if (popup.closed) {
          this.props.actions.cancel()
          this.props.onCancel()
          // dispatch auth canceled
        } else {
          let token
          try {
            token = querystring.parse(popup.location.search.substr(1))
          } catch (e) { }
          if (token && token.access_token) {
            // 同步用户信息
            this.props.actions.complete(token, this.props.onSuccess)
            popup.close()
          } else {
            setTimeout(this.listenPopup.bind(this, popup), 0)
          }
        }
      }
      render () {
        const {oauth, dispatch, actions, provider, onCancel, onSuccess, onFailed, ...rest} = this.props
        let props = Object.assign({}, rest)
        props.disabled = oauth.authenticating || oauth.user !== null
        props.onClick = _.wrap(props.onClick, (func, e) => {
          this.handleClick(e, provider)
          return func(e)
        })
        return <Button {...props} />
      }
    })
}
