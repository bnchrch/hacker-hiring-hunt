import React, {useState, useEffect} from 'react';
// import logo from './logo.svg';
// import './App.css';
import getOr from 'lodash/fp/getOr';
import Select from 'react-select';


const fetchWith = async (url) => {
  const response = await fetch(url)
  return await response.json()
};

const fetchUrl = (url) => {
  const [response, setResponse] = useState(undefined);
  useEffect(async () => {
    const jsonResponse = await fetchWith(url)
    setResponse(jsonResponse)
  })

  return response;
}

const fetchWhosHiringThreads = () => {
  const data = fetchUrl("https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring");
  return getOr([], 'hits', data);
}

const HackerSearchPure = () => {
  const threads = fetchWhosHiringThreads();
  const [selectedThread, setSelectThread] = useState(undefined);

  const formatedThreads = threads.map(({title, objectID}) => ({label: title, value: objectID}));

  console.dir(threads)
  return (
    <div className="App">
      {getOr("NOPE", 'value', selectedThread)}
      <Select
        value={selectedThread}
        onChange={setSelectThread}
        options={formatedThreads}
      />
  </div>

  );
};

export default HackerSearchPure;
