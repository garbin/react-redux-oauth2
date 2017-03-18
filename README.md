# redux-oauth
Redux OAuth Component, server rendering supported

## Config
```js
import configureOauth2 from 'react-redux-oauth'

configureOauth2({
  client_id: 'YOUR client id',
  client_secret: 'YOUR client secret',
  url: 'http://localhost:5000/api', // your oauth server root
  providers: {
    github: '/auth/github' // provider path
  }
})
```
## Reducer
```js
import {reducer} from 'react-redux-oauth2'
combineReducers(
  // ... your reducers
  ...reducer
);
```
## Signin Button
```js
import {OAuthSignin} from 'react-redux-oauth2'

let Signin = OAuthSignin(class extends React.Component {
  render(){
    return <button {...this.props} />
  }
}, {
  width: ...
  height: ...
});
//
<Signin provider='github' onSuccess={...} onFailed={...} onCancel={...} />
```

## Signout Button
```js
import {OAuthSignout} from 'react-redux-oauth2'
let Signout = OAuthSignout(class extends React.Component {
  render(){
    return <button {...this.props} />
  }
});
//
<Signout />
```
