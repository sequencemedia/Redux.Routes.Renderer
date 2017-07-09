import React from 'react'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'
import ReactDOMServer from 'react-dom/server'
import Boom from 'boom'

const ROUTER_MATCH = 'Renderer encountered an error raised by ReactRouter.match()'
const REACT_RENDER =
  '(1) Renderer caught an implementation error in ReactDOMServer.renderToString()'
const REDUX_RESOLVE =
  '(2) Renderer caught an implementation error in ReactDOMServer.renderToString()'

const badImplementation = (e, message) => Boom.wrap(e, 500, message)
const notFound = (location) => Boom.notFound(`ReactRouter.match() cannot find ${location}`)

/**
 * @return {Array}
 */
const reduce = (was, now) => was.concat(({ needs = [] }) => needs)

/**
 * @return {Promise}
 */
const resolveComponentNeeds = (dispatch, components, params) => Promise.all(components.reduce(reduce, []).map((need) => dispatch(need(params))))

/**
 * @return {String}
 */
const renderToString = (store, props) => (
  ReactDOMServer.renderToString(
    <Provider store={store}>
      <RouterContext
        {...props}
      />
    </Provider>
  )
)

export class Renderer {
  /**
   * @return {Promise}
   */
  render = (store, routes, location) => (
    new Promise((resolve, reject) => {
      match({ routes, location }, (e, redirect, props) => {
        let b
        if ((b = !!e) || (!redirect && !props)) {
          return reject(
            (b)
              ? badImplementation(e, ROUTER_MATCH)
              : notFound(location)
          )
        }
        if (redirect) return resolve({ redirect })

        const {
          dispatch,
          getState
        } = store

        const {
          components,
          params
        } = props

        resolveComponentNeeds(dispatch, components, params)
          .then(() => {
            try {
              const rendered = renderToString(store, props)
              const state = getState()
              resolve({ rendered, state })
            } catch (e) {
              reject(badImplementation(e, REACT_RENDER))
            }
          })
          .catch((e) => {
            reject(badImplementation(e, REDUX_RESOLVE))
          })
      })
    })
  )
}
