/* eslint promise/param-names: 0 */

import React from 'react'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import ReactDOMServer from 'react-dom/server'
import Boom from 'boom'

const ROUTER_MATCH = 'Renderer encountered an error raised by ReactRouter.match()'
const REACT_RENDER = 'Renderer caught an implemetation error in ReactDOMServer.renderToString()'
const REDUX_RESOLVE = 'Renderer caught an implemetation error in ReactDOMServer.renderToString()'

const badImplementation = (message, e) => Boom.badImplementation(message, Boom.wrap(e))
const notFound = (location) => Boom.notFound(`ReactRouter.match() cannot find ${location}`)

/**
 * @return {Array}
 */
const reduce = (was, now) => was.concat((now) ? now.needs || [] : [])

/**
 * @return {Promise}
 */
const resolveComponentNeeds = (dispatch, components, params) => Promise.all(components.reduce(reduce, []).map((need) => dispatch(need(params))))

/**
 * @return {String}
 */
const renderToString = (store, props) => ReactDOMServer.renderToString(
  <Provider store={store}>
    <RouterContext
      {...props}
    />
  </Provider>
)

export class Renderer {
  /**
   * @return {Promise}
   */
  render (store, routes, location) {
    return new Promise((success, failure) => {
      match({ routes, location }, (e, redirect, props) => {
        let b
        if ((b = !!e) || (!redirect && !props)) {
          return failure(
            (b)
              ? badImplementation(ROUTER_MATCH, e)
              : notFound(location)
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
              const rendered = renderToString(store, props)
              const state = store.getState()
              success({ rendered, state })
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
