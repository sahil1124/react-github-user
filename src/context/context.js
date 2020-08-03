import React, { useState, useEffect, createContext } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';


const GithubContext = createContext()

const GithubProvider = ({ children }) => {
    const [githubUser, setGithubUser] = useState(mockUser)
    const [repos, setRepos] = useState(mockRepos)
    const [followers, setFollowers] = useState(mockFollowers)

    //request loading
    const [requests, setRequests] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    //errors
    const [error, setError] = useState({ show: false, msg: "" })

    const searchGithubUser = async (user) => {
        toggleError()
        setIsLoading(true)
        const response = await axios.get(`${rootUrl}/users/${user}`)
            .catch(err => console.log(err))

        if (response) {
            setGithubUser(response.data)
            const { login, followers_url } = response.data
            //repos
            await axios.get(`${rootUrl}/users/${login}/repos?per_page=100`)
                .then(response =>
                    setRepos(response.data)
                )
            //followers
            await axios.get(`${followers_url}?per_page=100`)
                .then(response =>
                    setFollowers(response.data)
                )
        }
        else {
            toggleError(true, 'there is no user with that username!!')
        }
        checkRequests()
        setIsLoading(false)
    }

    //check rate
    const checkRequests = () => {
        axios.get(`${rootUrl}/rate_limit`).then(({ data }) => {
            let { rate: { remaining } } = data;

            setRequests(remaining)
            if (remaining === 0) {
                //throw an error
                toggleError(true, 'sorry, You have excceeded your hourly rate limit!!')
            }
        })
            .catch((err) => {
                console.log(err);
            })
    }

    function toggleError(show = false, msg = '') {
        setError({ show, msg })
    }

    //error

    useEffect(() => {
        checkRequests()
    }, []);

    return (
        <GithubContext.Provider
            value={{
                githubUser: githubUser, repos: repos, followers: followers,
                requests: requests, error: error, searchGithubUser: searchGithubUser,
                isLoading: isLoading
            }}>
            {children}
        </GithubContext.Provider>
    )
}

export { GithubContext, GithubProvider }