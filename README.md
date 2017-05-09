# react-redux-oauth2

[![react-redux-oauth2][npm-badge]][npm]

Redux OAuth Component, server rendering supported

[npm-badge]: https://img.shields.io/npm/v/react-redux-oauth2.png?style=flat-square
[npm]: https://www.npmjs.org/package/react-redux-oauth2


## Reducer
```js
import {reducer} from 'react-redux-oauth2'
combineReducers(
  // ... your reducers
  oauth: reducer
);
```

## Usage
```js
import { actions, reducer, signin, signout } from 'react-redux-oauth'

class YourComponent extends React.Component {
  componentWillMount () {
    const { dispatch } = this.props
    dispatch(actions.config({
      client_id: 'YOUR client id',
      client_secret: 'YOUR client secret',
      url: 'http://localhost:5000/api', // your oauth server root
      providers: {
        github: '/auth/github' // provider path
      }
    }))
  }
  async handlesignin (e) {
    const { dispatch } = this.props
    e.preventdefault()
    await dispatch(actions.signin({
      username: this.refs.username.value,
      password: this.refs.password.value
    }))
  }
  render () {
    const { oauth } = this.props
    const Signin = signin({
      popup: {},    // popup settings
      success () {}, // invoke when signin success
      failed () {}, // invoke when signin failed
      cancel () {} // invoke when signin cancel
    })(props => <button {...props} />)
    const Signout = singout()(props => <button {...props} />)
    return (
      <div>
        <form onSubmit={this.handleSignin.bind(this)}>
          <input type='text' name='username' ref='username' placeholder='username' />
          <input type='text' name='password' ref='password' placeholder='password' />
          <button type='submit' disabled={oauth.authenticating}>Signin</button>
        </form>
        <hr />
        <Signin provider='github'>Signin</Signin>
        <hr />
        <Signout>Signout</Signout>
      </div>
    )
  }
}
```
For a full runable example see `./demo/src`
## Run Demo & debug locally
```bash
npm start
```
http://localhost:3000 for debug
