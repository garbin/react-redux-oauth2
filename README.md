# redux-oauth
Redux OAuth Component, server rendering supported

## Reducer
```js
import {reducer} from 'redux-oauth2'
combineReducers(
  // ... your reducers
  ...reducer
);
```
## Signin Button
```js
import {OAuthSignin} from 'redux-oauth2'

let Signin = OAuthSignin(class extends React.Component {
  render(){
    return <button {...this.props} />
  }
});
//
<Signin provider='github' onSuccess={...} onFailed={...} onCancel={...} />
```

## Signout Button
```js
import {OAuthSignout} from 'redux-oauth2'
let Signout = OAuthSignout(class extends React.Component {
  render(){
    return <button {...this.props} />
  }
});
//
<Signout />
```

## HoC to initialize auth state
```js
import {OAuthComponent} from 'redux-oauth2'
class App extends React.Component {
  render(){
    ...
  }
}

export default OAuthComponent(App);
```
