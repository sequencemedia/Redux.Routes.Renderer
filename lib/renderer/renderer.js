/* eslint promise/param-names: 0 */

import React from 'react'
import { match, RouterContext } from 'react-router'
import { Provider } from 'react-redux'
import ReactDOMServer from 'react-dom/server'
import createHistory from 'history/lib/createHistory'
import Boom from 'boom'

const ROUTER_MATCH = 'Renderer encountered an error raised by ReactRouter.match()'
const REACT_RENDER = 'Renderer caught an implemetation error in ReactDOMServer.renderToString()'
const REDUX_RESOLVE = 'Renderer caught an implemetation error in ReactDOMServer.renderToString()'

const badImplementation = (message, e) => Boom.badImplementation(message, Boom.wrap(e))
const notFound = (path) => Boom.notFound(`ReactRouter.match() cannot find ${path}`)

const history = createHistory()

const reduce = (was, now) => {
  return (now)
    ? was.concat(now.needs || [])
    : was
}

/**
 * @return {Promise}
 */
const resolveComponentNeeds = (dispatch, components, params) => {
  const needs = components.reduce(reduce, [])
  return Promise.all(
    needs.map((need) => dispatch(need(params)))
  )
}

export class Renderer {

  /**
   * @return {Promise}
   */
  render (store, routes, path) {
    const location = history.createLocation(path)
    return new Promise((success, failure) => {
      match({ routes, location }, (e, redirect, props) => {
        let b
        if ((b = !!e) || (!redirect && !props)) {
          return failure(
            (b)
              ? badImplementation(ROUTER_MATCH, e)
              : notFound(path)
          )
        }
        if (redirect) return success({ redirect })

        const {
          dispatch
        } = store

        const {
          components,
          params
        } = props

        resolveComponentNeeds(dispatch, components, params)
          .then(() => {
            try {
              const rendered = ReactDOMServer.renderToString(
                <Provider store={store}>
                  <RouterContext
                    {...props}
                  />
                </Provider>
              )
              success({ rendered })
            } catch (e) {
              failure(badImplementation(REACT_RENDER, e))
            }
          })
          .catch((e) => {
            failure(badImplementation(REDUX_RESOLVE, e))
          })
      })
    })
  }

}
