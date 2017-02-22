# redux-oauth
Redux OAuth Component, server rendering supported

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
