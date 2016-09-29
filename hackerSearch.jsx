import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Router, browserHistory, hashHistory } from 'react-router';
import { Col, Fade, Grid } from 'react-bootstrap';
import Spinner from 'react-spinkit';
import $ from 'jquery';
import WhosHiringSelect from './whosHiringSelect.jsx'
import CommentList from './commentList.jsx'
import KeywordFilter from './keywordFilter.jsx'

class HackerSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        comments: [],
        searchWords: [],
        id: "",
        loading: false 
    };
  };

  changeUrl(id) {
      console.dir(this)
      browserHistory.push(id);
  }

  loadThreadById(id) {
    this.setState({id: id, loading: true, comments: []})
    this.serverRequest = $.get(`http://hn.algolia.com/api/v1/items/${id}`, (result) => {
        let comments = result.children.filter(x => x.text);
        this.setState({comments: comments, loading: false});
      });
  }

  componentWillReceiveProps(newProps) {
    if(newProps.params.threadId) {
      this.loadThreadById(newProps.params.threadId);
    }
  }

  render() {
     return (
        <Grid className="hackerSearch">
          <Col md={8} mdOffset={2}>
            <h1>Hacker Hiring Hunt</h1>
            <WhosHiringSelect handleSelect={this.changeUrl.bind(this)}/>
            <Fade in={this.state.comments.length > 0}>
              <div>
                <KeywordFilter keywordsChanged={this.keywordsChanged.bind(this)}/>
                <CommentList comments={this.state.comments} searchWords={this.state.searchWords}/>
              </div>
            </Fade>
            <Spinner hidden={!this.state.loading} spinnerName='double-bounce' noFadeIn={true} />
          </Col>
        </Grid>
    );
  }

  keywordsChanged(keywords) {
    this.setState({searchWords: keywords})
  }

  threadSelected(e) {
    let id = e.target.value;
    this.loadThreadById(id)
  }
}

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={HackerSearch} />
    <Route path="/:threadId" component={HackerSearch} />
  </Router>,
  document.getElementById('content')
);
