import React from 'react';
import { Fade, FormControl, FormGroup } from 'react-bootstrap';
import Spinner from 'react-spinkit';
import $ from 'jquery';

export default class WhosHiringSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        threads: []
    };
  };

  componentDidMount() {
    this.serverRequest = $.get("http://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring", (result) => {
      this.setState({ threads: result.hits})
    })
  };

  render () {
    return (
      <Fade in={this.state.threads.length> 0}>
      <FormGroup className="whosHiringSelect" controlId="formControlsSelect">
      <FormControl componentClass="select" placeholder="select" ref="userInput" defaultValue="" onChange={this.props.handleSelect}>
        <option value="" disabled>Select a thread</option>
        {
          this.state.threads.map((thread => {
            return <option key={thread.objectID} value={thread.objectID}>{thread.title.replace("Ask HN: ", "")}</option>;
          }))
        }
      </FormControl>
      </FormGroup>
      </Fade>
    );
  }
}