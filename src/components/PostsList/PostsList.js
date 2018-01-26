import React from 'react';
import {connect} from 'react-redux';
import {
  getPostsList,
  initPostsList,
} from '../../actions/postsList';
import {debounce} from 'lodash';
import Constants from '../../common/constants';
import InfiniteScroll from 'react-infinite-scroller';
import LoadingSpinner from '../LoadingSpinner';
import Post from './Post/Post';
import HeadingLeadComponent from '../Atoms/HeadingLeadComponent';


class PostsList extends React.Component {
  static defaultProps = {
    cancelPrevious: false,
    maxPosts: 9999,
    ignored: [],
    clearPostHeader: false,
    isComponentVisible: true
  };

  constructor(props) {
    super(props);
    let postsListOptions = {
      point: this.props.point,
      cancelPrevious: this.props.cancelPrevious,
      options: this.props.options,
      maxPosts: this.props.maxPosts,
      loading: false,
      postsIndices: [],
      length: 0,
      hasMore: true,
      ignored: this.props.ignored,
    };
    this.props.initPostsList(postsListOptions);
    this.getPostsList = this.getPostsList.bind(this);
  }

  componentDidMount() {
    this.getPostsList();
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.point !== this.props.point) {
      let postsListOptions = {
        point: this.props.point,
        cancelPrevious: this.props.cancelPrevious,
        options: this.props.options,
        maxPosts: this.props.maxPosts,
        loading: false,
        postsIndices: [],
        length: 0,
        hasMore: true,
        ignored: this.props.ignored
      };
      this.props.initPostsList(postsListOptions);
    }
  }

  getPostsList() {
    this.props.getPosts(this.props.point);
  }

  renderPosts() {
    if (!this.props.length) {
      return (
        <div className="empty-query-message">
          {Constants.EMPTY_QUERY}
        </div>
      );
    }
    let posts = [];
    this.props.postsIndices.forEach((postIndex) => {
      if (this.props.ignored.indexOf(postIndex) == -1) {
        posts.push(<Post key={this.props.point + "/" + postIndex}
                         index={postIndex}
                         point={this.props.point}
                         clearPostHeader={this.props.clearPostHeader}
        />);
      }
    });

    return posts;
  }
  
  renderHeader() {
    if (this.props.headerText) return (
      <HeadingLeadComponent text={this.props.headerText} />
    );
    return null;
  }

  render() {
    if (!this.props.length) return null;
    return (
      <div className={this.props.className}>
        {this.renderHeader()}
        <InfiniteScroll
          pageStart={0}
          initialLoad={false}
          loadMore={debounce(this.getPostsList,
          Constants.ENDLESS_SCROLL.DEBOUNCE_TIMEOUT)}
          hasMore={this.props.isComponentVisible && this.props.hasMore}
          loader={
            <div className="position--relative">
              <LoadingSpinner/>
            </div>
          }
          threshold={Constants.ENDLESS_SCROLL.OFFSET}
        >
          <div className="posts-list container_pos-lis">
            {this.renderPosts.bind(this)()}
          </div>
        </InfiniteScroll>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    ...state.postsList[props.point],
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    initPostsList: (options) => {
      dispatch(initPostsList(options));
    },
    getPosts: (point) => {
      dispatch(getPostsList(point));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PostsList);
