import React from 'react';
import './App.css';
import { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';
import Comment from './Comment.js'

//.links.video_link call to query
const launchesQuery = `{
  launches {
    id
    launch_success
    mission_name
    launch_date_utc
    launch_site {
      site_name
    }
    rocket {
      rocket_name
    }
    links {
      video_link
    }
    details
  }
}`;

const commentsQuery = flightNumber => `{
  launchCommentsByFlightNumber(flightNumber: ${flightNumber}) {
    items {
      id
      author
      body
      date
    }
  }
`;


/*
You are trying to encapsulate the logic below into a reusable function so that
you may run mutliple queries as needed
*/
function setupGraphQL(endpoint, config = {}) {
  const client = new GraphQLClient(endpoint, config);

  
  return function useGraphQL(query) {
    // here we are arbitrarily setting a state object that we want React to
    // watch for changes. Notice how we're not inside of a component, and yet
    // we can still have React Virtual reactively respond to changes in this state
    // just like it does inside of conventional component state objects
    const [state, setState] = useState({ loading: true });

    // useEffect is a function that comes from React, and allows to perform
    // aysnchronous sideeffects 
    useEffect(() => {
      client.request(query).then(
        data => {
          setState({ data, loading: false });
        },
        err => {
          console.error(err);
        }
      );
    }, [query]);

    return state;
  };
}

function Header() {
  return (
    <div className="page-head">
      <h2 className="page-head-title text-center">Space X Launches</h2>
    </div>
  );
}

function Loading() {
  return (
    <div className="progress">
      <div
        className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
        role="progressbar"
        style={{ width: '100%' }}
        aria-valuenow="100"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        Loading
      </div>
    </div>
  );
}

function Launches({ launches, getCommentsIndex }) {
  const launchesByDate = launches.reduce((list, launch) => {
    //1. take each launch; get the utc date (to 10 digits,
    //which includes month and day)
    //and assign it to a variable called date
    //2. combine all the launches into a an object called list
    //where the key is date and the value is 
    //the launch object itself 
    const date = launch.launch_date_utc.slice(0, 10);
    list[date] = list[date] || [];
    list[date].push(launch);

    //1. create empty object that will hold sorted list object
    const sortedList = {}
    
    //2. ceate array of list's keys (the dates), then
    Object.keys(list)
    //3. then sort it
    .sort()
    //4. then create a new object by iterating through each
    // array item, finding the corresponding launch objects in 
    //the list object, and assigning this all to the 
    // sortedList object
    .forEach(key => {
      sortedList[key] = list[key]
    })
    //5. return the sortedList object 
    return sortedList;
  }, {});

  //changed key to launch.id since there
  //is no flight_number key in the API and the id will
  //be unique each time
  return (
    <ul data-testid="launches" className="timeline timeline-variant">
      {Object.keys(launchesByDate).map(launchDate => (
        <span key={launchDate}>
          <li className="timeline-month">{launchDate}</li>
          {launchesByDate[launchDate].map(launch => (
            <Launch key={launch.id} launch={launch} getCommentsIndex={getCommentsIndex} />
          ))}
        </span>
      ))}
    </ul>
  );
}


function Launch({ launch, getCommentsIndex }) {
  const launchIcon = launch.launch_success ? (
    <i className="icon mdi mdi-rocket" />
  ) : (
    <i className="icon mdi mdi-bomb" />
  );
  
  //set incoming YouTube URL to more workable variable
  const youTubeUrl = launch.links.video_link

  //edit YouTubeURL to embed rather than watch 
  //function returns array
  const videoIdGrabber = (url) => {
    // eslint-disable-next-line
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    //make sure no 'null' url's enter functions
    if (url !== null) {
    const match = url.match(regExp);
      if (match && match[2].length === 11) {
          return match[2];
      } else {
          return 'error';
      }
    } else {
      return 'error'
    }
  }
    //save match[2], the video id itself, as a variable 
    const videoId = videoIdGrabber(youTubeUrl)

  return (
    <li className="timeline-item timeline-item-detailed right">
      <div className="timeline-content timeline-type file">
        <div className="timeline-icon">{launchIcon}</div>

        <div className="timeline-header">
          <span className="timeline-autor">
            #{launch.id}: {launch.mission_name}
          </span>{' '}
          <p className="timeline-activity">
            {launch.rocket.rocket_name} &mdash; {launch.launch_site.site_name}
          </p>
          <span className="timeline-time">{launch.launch_date_utc.slice(0, 10)}</span>
        </div>
        <div className="timeline-summary">
          <p>{launch.details}</p>
        </div>
        <div className="timeline-video">
          <iframe 
          title={launch.mission_name} 
          src={"https://www.youtube.com/embed/" + videoId}>
          </iframe> 
        </div>
        <button onClick={getCommentsIndex}>Comments</button>
      </div>
    </li>
  );
}

export default function App() {
  const useSpaceXGraphQL = setupGraphQL('https://api.spacex.land/graphql/');
  const useSpaceXCommentsGraphQL = setupGraphQL('https://pb3c6uzk5zhrzbcuhssogcpq74.appsync-api.us-east-1.amazonaws.com/graphql');
  const { data: launchesData, loading: launchesLoading } = useSpaceXGraphQL(launchesQuery);
  const { data: commentsData, loading: commentsLoading } = useSpaceXCommentsGraphQL(commentsQuery('1'), {
    headers: {
      'x-api-key': 'da2-tadwcysgfbgzrjsfmuf7t4huui' 
    }
  });

  const [state, setState] = useState({ commentsData: null });

  const getCommentsIndex = (endpoint, config = {}) => {
    
    const client = new GraphQLClient(endpoint, config)
      
      
  
    return function useGraphQL(query) {
      // here we are arbitrarily setting a state object that we want React to
      // watch for changes. Notice how we're not inside of a component, and yet
      // we can still have React Virtual reactively respond to changes in this state
      // just like it does inside of conventional component state objects
      const [state, setState] = useState({ loading: true });
      console.log('got here')
      // useEffect is a function that comes from React, and allows to perform
      // aysnchronous sideeffects 
      useEffect(() => {
        client.request(query).then(
          data => {
            setState({ data, loading: false });
          },
          err => {
            console.error(err);
          }
        );
      }, [query]);
      console.log(state)
      return state;
    
    };

  }

  return (
    <div>
      <Header />
      {launchesLoading ? <Loading /> : <Launches launches={launchesData.launches} getCommentsIndex={getCommentsIndex}/>}
      {state.commentsData ? <Comment comments={commentsData}/> : null }
    </div>
  );
}
