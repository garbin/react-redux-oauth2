import React from 'react'
import {render} from 'react-dom'
import { connect, Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { actions, reducer, signin, signout } from '../../src'

const { devToolsExtension = f => f } = global.window || {}
const store = createStore(combineReducers({ oauth: reducer }), compose(
  applyMiddleware(thunk),
  devToolsExtension()
))

const Demo = connect(state => ({oauth: state.oauth}))(class extends React.Component {
  componentWillMount () {
    const { dispatch } = this.props
    dispatch(actions.config({
      token: '/auth/token',
      client_id: '0f434d4b-06bf-4cb2-b8f4-f20bf9349beb',
      client_secret: '530897d5880494a6a9ac92d1273d8ba5',
      url: 'http://localhost:5000/api',
      providers: {
        github: '/auth/connect/github'
      }
    }))
  }
  async handleSignin (e) {
    const { dispatch } = this.props
    e.preventDefault()
    await dispatch(actions.signin({
      username: this.refs.username.value,
      password: this.refs.password.value
    }, console.log))
  }
  render () {
    const { oauth } = this.props
    const Signin = signin({
      success (user) {
        console.log(user)
      }
    })(props => <button {...props} />)
    const Signout = signout()(props => <button {...props} />)
    return (
      <div>
        <h1>react-redux-oauth2 Demo</h1>
        <div>
          <form onSubmit={this.handleSignin.bind(this)}>
            <input type='text' name='username' ref='username' placeholder='username' />
            <input type='text' name='password' ref='password' placeholder='password' />
            <button type='submit' disabled={oauth.authenticating}>Signin</button>
          </form>
          <hr />
          <Signin provider='github'>Signin with Github</Signin>
          <hr />
          <Signout>Signout</Signout>
        </div>
      </div>
    )
  }
})

render((
  <Provider store={store}>
    <Demo />
  </Provider>
), document.querySelector('#demo'))
