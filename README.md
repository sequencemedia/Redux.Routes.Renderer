# React.Routes.Renderer

A Promise interface for rendering isomorphic React components at the server. You can instantiate this class in ES5+ without transpiling or refactoring your application.

```
var Renderer = require('react-routes-renderer').Renderer,
	renderer = new Renderer(),
	routes = require('./path/to/routes').routes;
```

In your web server's request handler:

```
var path = '/request/path';
renderer.render(routes, path)
	.then(function (o) {
		/*
			Your success response
		*/
	.catch(function (e) {
		/*
			Your error response
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