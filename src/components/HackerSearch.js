import React, {Fragment} from 'react';

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
    <Fragment>
      <Select
        value={selectedThread}
        onChange={(thread) => setSelectedThread(thread)}
        options={threadOptions}
        placeholder="select"
        className="marginBottom"
      />

      {threadId && <CommentList threadId={threadId}/>}
    </Fragment>
  );
};

const HackerSearch = withHiringThreads(HackerSearchPure);

export default HackerSearch;
