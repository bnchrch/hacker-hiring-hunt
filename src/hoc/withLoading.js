import React from 'react';

import branch from 'recompose/branch';
import renderComponent from 'recompose/renderComponent';

import Spinner from 'react-spinkit';

/**
 * Loading Spinner
 * @returns {*} React Component
 */
const LoadingSpinner = () => (
  <div className="loadingMessage">
    <h1>fetching... </h1>
    <Spinner name="double-bounce" color="#ff6600" noFadeIn />
    </div>
);

/**
 * Check if loading prop is true
 * @returns {Boolean} if loading
 */
const isLoading = ({loading}) => loading;

const withLoading = branch(isLoading, renderComponent(LoadingSpinner));

export default withLoading;
