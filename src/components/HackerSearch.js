import React, {Fragment} from 'react';

import getOr from 'lodash/fp/getOr';
import get from 'lodash/fp/get';
import orderBy from 'lodash/fp/orderBy';
import find from 'lodash/fp/find';
import flow from 'lodash/fp/flow';

import Select from 'react-select';

import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';

import withFetch from '../hoc/withFetch';
import CommentList from '../components/CommentList';

const threadsUrl =
  'https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring';

const parseThreadResponse = (threadResponse) => {
  const threads = getOr([], 'hits', threadResponse);
  const threadOptions = threads.map(({title, objectID}) => ({
    label: title,
    value: objectID,
  }));
  return {threadOptions};
};

// Set the drop down to the latest who's hiring thread
const setDefaultThread = flow(
  get('threadOptions'),
  orderBy('value', 'desc'),
  find(({label}) => label.toLowerCase().includes('hiring?'))
);

const withHiringThreads = compose(
  withProps({threadsUrl}),
  withFetch('threadsUrl', parseThreadResponse),
  withState('selectedThread', 'setSelectedThread', setDefaultThread)
);

const HackerSearchPure = ({
  threadOptions,
  selectedThread,
  setSelectedThread,
}) => {
  const threadId = get('value', selectedThread);

  return (
    <Fragment>
      <Select
        value={selectedThread}
        onChange={(thread) => setSelectedThread(thread)}
        options={threadOptions}
        placeholder="select"
        className="spacing"
        isSearchable
      />

      {threadId && <CommentList threadId={threadId} />}
    </Fragment>
  );
};

const HackerSearch = withHiringThreads(HackerSearchPure);

export default HackerSearch;
