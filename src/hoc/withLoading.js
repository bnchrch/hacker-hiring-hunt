import React from 'react';

import branch from 'recompose/branch';
import renderComponent from 'recompose/renderComponent';

import Spinner from 'react-spinkit';

const LoadingSpinner = () => (
  <Spinner name="double-bounce" color="#ff6600" noFadeIn />
);

const isLoading = ({loading}) => loading;

const withLoading = branch(isLoading, renderComponent(LoadingSpinner));

export default withLoading;
