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
        id: "" 
    };
  };

  render() {
    if (this.state.id != "") {
      this.serverRequest = $.get(`http://hn.algolia.com/api/v1/items/${this.state.id}`, (result) => {
        let comments = result.children.filter(x => x.text);
        this.setState({comments: comments})
      });
    }

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
              <Spinner hidden={this.state.id === "" && this.state.comments.length === 0} spinnerName='double-bounce' />
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
    this.setState({id: id})
  }
}

ReactDOM.render(
  <HackerSearch />,
  document.getElementById('content')
);
