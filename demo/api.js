const { Koapi, middlewares, router } = require('koapi')

const app = new Koapi()
const route = new router.Router()
route.get('/api/auth/token', async ctx => {
  ctx.body = {
    id: 1,
    username: 'admin',
    email: 'garbinh@gmail.com',
    avatar: 'https://avatars2.githubusercontent.com/u/63785?v=3&s=460',
    created_at: '2017-05-08T16:30:46.269Z',
    updated_at: '2017-05-08T16:30:46.269Z'
  }
})
route.post('/api/auth/token', async ctx => {
  ctx.status = 201
  ctx.body = {
    'access_token': 'fc46a2e90faf6b4b366be5e7475dee69',
    'refresh_token': 'c0b65277ddbb1372d372aa7ba61b10b2',
    'expires': 7200,
    'token_type': 'Bearer'}
})
route.del('/api/auth/token', async ctx => {
  ctx.status = 204
})
route.get('/api/auth/github/callback', async ctx => {
  ctx.redirect('http://localhost:3000/?access_token=fc46a2e90faf6b4b366be5e7475dee69')
})
route.get('/api/auth/connect/github', async ctx => {
  ctx.redirect('/api/auth/github/callback')
})
app.use(middlewares.preset('restful'))
app.use(route.routes())
app.use(route.allowedMethods())
app.listen(5000, e => console.log('API listening on port 5000'))
