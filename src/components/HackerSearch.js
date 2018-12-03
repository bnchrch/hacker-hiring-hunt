import React from 'react';

import getOr from 'lodash/fp/getOr';
import get from 'lodash/fp/get';

import Select from 'react-select';

import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';

import withFetch from '../hoc/withFetch';
import CommentList from '../components/CommentList';

// THREADS

const threadsUrl = "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring"

const parseThreadResponse = (threadResponse) => {
  const threads = getOr([], 'hits', threadResponse)
  const threadOptions = threads.map(({title, objectID}) => ({label: title, value: objectID}))
  return {threadOptions}
};

const withHiringThreads = compose(
  withProps({threadsUrl}),
  withFetch('threadsUrl', parseThreadResponse),
  withState('selectedThread', 'setSelectedThread', {}),
);

// MAIN

const HackerSearchPure = ({threadOptions, selectedThread, setSelectedThread}) => {
  const threadId = get('value', selectedThread);
  console.log("HS", threadId)
  return (
    <div>
      <Select
        value={selectedThread}
        onChange={(thread) => setSelectedThread(thread)}
        options={threadOptions}
        placeholder="select"
      />

      {threadId && <CommentList threadId={threadId}/>}
    </div>
  );
};

const HackerSearch = withHiringThreads(HackerSearchPure);

export default HackerSearch;
