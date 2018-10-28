import React from 'react';
import logo from './logo.svg';
import './App.css';

import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import withState from 'recompose/withState';
import lifecycle from 'recompose/lifecycle';

const HackerSearchPure = ({test, threads = []}) => (
  <div className="App">
    WAHT
    {test && test.hits.map(({title}) => <div>{title}</div>)}
  </div>
);

const HackerSearch = compose(
  withState('test', 'setTest', undefined),
  lifecycle({
    async componentWillMount () {
      const hold = await fetch("https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring")
      const hold2 = await hold.json()
      console.dir(hold2)
      this.props.setTest(hold2)
      return {test: "WHAT"}
    }
  })
)(HackerSearchPure)

export default HackerSearch;
