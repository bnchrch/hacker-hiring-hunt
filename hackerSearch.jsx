import React from 'react';
import ReactDOM from 'react-dom';
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

  loadThreadById(id) {
    this.setState({id: id, loading: true, comments: []})
    this.serverRequest = $.get(`http://hn.algolia.com/api/v1/items/${id}`, (result) => {
        let comments = result.children.filter(x => x.text);
        this.setState({comments: comments, loading: false});
      });
  }

  render() {
     return (
        <Grid className="hackerSearch">
          <Col md={8} mdOffset={2}>
            <h1>Hacker Hiring Hunt</h1>
            <WhosHiringSelect handleSelect={this.threadSelected.bind(this)}/>
            <Fade in={this.state.comments.length > 0}>
              <div>
                <KeywordFilter keywordsChanged={this.keywordsChanged.bind(this)}/>
                <CommentList comments={this.state.comments} searchWords={this.state.searchWords}/>
              </div>
            </Fade>
            <Col md={8} mdOffset={2}>
              <Spinner hidden={!this.state.loading} spinnerName='double-bounce' noFadeIn={true} />
            </Col>
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
  <HackerSearch />,
  document.getElementById('content')
);
