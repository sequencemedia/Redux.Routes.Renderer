# Redux.Routes.Renderer

A Promise interface for rendering isomorphic React Redux components in Node.

An example implementation can be found in `v2` of [React.Router.Pagination.IO](http://github.com/sequencemedia/React.Router.Pagination.IO.git).

A companion package, `react-routes-renderer`, is for React applications without Redux.

## Example

In your web server:
```
const { Renderer } = require('redux-routes-renderer')

const renderer = new Renderer()
```

Configure your store:

```
const { configureStore } = require('./path/to/store')

const store = configureStore()
```

In your web server's request handler:

```
const routes = require('./path/to/routes')
const path = '/request/path'

renderer.render(store, routes, path)
  .then((o) => {
    /*
     *  Your success response
     */
  .catch((e) => {
    /*
     *  Your failure response
     */
  });
```

If React Router can match the request path to a route definition and it is rendered, then your server's success response handler will receive an object which looks like:

```
{ rendered: /* String */ }
```

The `rendered` string will be whatever is returned from `ReactDOMServer.renderToString()`.

If React Router matches the request path to a redirect definition, then your success response handler will receive an object which looks like:

```
{ redirect: /* Object */ }
```

The `redirect` object will be whatever `location` is returned from `match()`.

If `match()` encounters an error, or `ReactDOMServer.renderToString()` encounters an error, then your error response handler will receive an error object; this is a `500 Internal Server Error`.

If `match()` cannot match the request path to a route definition, then your error response handler will receive a different error; this is a `404 Not Found`.
