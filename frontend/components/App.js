import React, { useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import ArticleForm from './ArticleForm'
import axios from 'axios'
import axiosWithAuth from '../axios'

export const articlesUrl = 'http://localhost:9000/api/articles'
export const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  const [articles, setArticles] = useState([])
  const [message, setMessage] = useState('')
  const [currentArticleId, setCurrentArticleId] = useState(null)
  const [fetching, setFetching] = useState(false)

  const navigate = useNavigate()

  const login = ({ username, password }) => {
    axios.post(loginUrl, { username, password })
      .then(res => {
        // store the token in browser local storage
        const token = res.data.token
        window.localStorage.setItem('token', token)
        // redirect to the articles page
        navigate('/articles')
      })
      .catch(err => {
        debugger // todo, render on screen
      })
  }

  const logout = () => {
    window.localStorage.removeItem('token')
    navigate('/')
  }

  const getArticles = () => {
    setFetching(true)
    axiosWithAuth().get(articlesUrl)
      .then(res => {
        setArticles(res.data.articles)
      })
      .catch(err => {
        setMessage(err?.response?.data?.message)
      })
      .finally(() => {
        setFetching(false)
      })
  }

  const postArticle = article => {
    setFetching(true)
    axiosWithAuth().post(articlesUrl, article)
      .then(res => {
        setArticles([...articles, res.data.article])
      })
      .catch(err => {
        setMessage(err.response.data.message)
      })
      .finally(() => {
        setFetching(false)
      })
  }

  const deleteArticle = article_id => {
    setFetching(true)
    axiosWithAuth().delete(`${articlesUrl}/${article_id}`)
      .then(res => {
        setMessage(res.data.message)
        setArticles(articles.filter(art => {
          return art.article_id !== article_id
        }))
      })
      .catch(err => {
        setMessage(err?.response?.data?.message)
      })
      .finally(() => {
        setFetching(false)
      })
  }

  const putArticle = article => {
    setFetching(true)
    const { article_id, ...changes } = article
    axiosWithAuth().put(`${articlesUrl}/${article_id}`, changes)
      .then(res => {
        setArticles(articles.map(art => {
          return art.article_id === article_id
            ? res.data.article
            : art
        }))
        setMessage(res.data.message)
        setCurrentArticleId(null)
      })
      .catch(err => {
        setMessage(err?.response?.data?.message)
      })
      .finally(() => {
        setFetching(false)
      })
  }

  const onSubmit = article => {
    if (currentArticleId) {
      putArticle(article)
    } else {
      postArticle(article)
    }
  }

  const updateArticle = article_id => {
    setCurrentArticleId(article_id)
  }

  return (
    <React.StrictMode>
      <button id="logout" onClick={logout}>Logout</button>
      <h1>Advanced Applications</h1>
      {message}
      <nav>
        <NavLink id="loginScreen" to="/">Login</NavLink>
        <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<LoginForm login={login} />} />
        <Route path="articles" element={
          <>
            <ArticleForm
              onSubmit={onSubmit}
              article={articles.find(art => art.article_id === currentArticleId)}
            />
            <Articles
              deleteArticle={deleteArticle}
              getArticles={getArticles}
              updateArticle={updateArticle}
              articles={articles}
              fetching={fetching}
            />
          </>
        } />
      </Routes>
    </React.StrictMode>
  )
}
