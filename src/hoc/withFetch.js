import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import lifecycle from 'recompose/lifecycle';

import withLoading from './withLoading';

const withCustomState = (initialState) => (compose(
    withState('state', 'setState', initialState),
    withHandlers({
      updateState: ({ setState, state }) => patch => setState({ ...state, ...patch }),
      resetState: ({ setState }) => () => setState(initialState)
    })
  ));

const withFetchState = compose(
  withCustomState({loading: true, refetch: false}),
  withProps(({state}) => ({...state})),
  withProps(({updateState}) => ({refreshData: () => updateState({refetch: true})})),
);

const withFetchOnMount = (urlPropName, responseParser) => {
  const fetcher = (props) => {
    fetch(props[urlPropName])
    .then(response => response.json())
    .then((response) => {
      props.updateState({loading: false, ...responseParser(response)})
    });
  }
  return lifecycle({
    componentWillMount() {
      fetcher(this.props)
    },
    componentWillUpdate(newProps) {
      const watchedValueChanged = newProps[urlPropName] !== this.props[urlPropName];
      const shouldReload = watchedValueChanged || newProps.refetch
      if (!newProps.loading && (shouldReload)) {
        newProps.updateState({loading: true, refetch: false})
        fetcher(newProps)
      }
    }
  })
};

const withFetch = (urlPropName, responseParser) => compose(
  withFetchState,
  withFetchOnMount(urlPropName, responseParser),
  withLoading,
);

export default withFetch;
