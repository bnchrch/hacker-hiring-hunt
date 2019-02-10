import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import lifecycle from 'recompose/lifecycle';

import withLoading from './withLoading';

/**
 * Add simple state handler
 * @param {Object} initialState - The state to start with
 * @returns {Function} HOC
 */
const withCustomState = (initialState) =>
  compose(
    withState('state', 'setState', initialState),
    withHandlers({
      updateState: ({setState, state}) => (patch) =>
        setState({...state, ...patch}),
      resetState: ({setState}) => () => setState(initialState),
    })
  );

const withFetchState = compose(
  withCustomState({loading: true, refetch: false}),
  withProps(({state}) => ({...state})),
  withProps(({updateState}) => ({
    refreshData: () => updateState({refetch: true}),
  }))
);

/**
 * Fetches data from a url located at the given prop on mount
 * @param {String} urlPropName - The prop to find the url
 * @param {Fucntion} responseParser - The callback that receives the data
 * @returns {Function} HOC
 */
const withFetchOnMount = (urlPropName, responseParser) => {
  /**
   * Fetches data for the given url
   * @param {Object} props - The calling components props
   * @returns {void}
   */
  const fetcher = (props) => {
    fetch(props[urlPropName])
      .then((response) => response.json())
      .then((response) => {
        props.updateState({loading: false, ...responseParser(response)});
      });
  };

  return lifecycle({
    componentWillMount() {
      fetcher(this.props);
    },
    componentWillUpdate(newProps) {
      const watchedValueChanged = newProps[urlPropName] !== this.props[urlPropName];
      const shouldReload = watchedValueChanged || newProps.refetch;

      if (!newProps.loading && shouldReload) {
        newProps.updateState({loading: true, refetch: false});
        fetcher(newProps);
      }
    },
  });
};

/**
 * Fetches data from a url located at the given prop
 * @param {String} urlPropName - The prop to find the url
 * @param {Fucntion} responseParser - The callback that receives the data
 * @returns {Function} HOC
 */
const withFetch = (urlPropName, responseParser) =>
  compose(
    withFetchState,
    withFetchOnMount(urlPropName, responseParser),
    withLoading
  );

export default withFetch;
