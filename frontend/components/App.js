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
    // we attach the token from local storage into the request
    // Authorization header
    axiosWithAuth().get(articlesUrl)
      .then(res => {
        setArticles(res.data.articles)
      })
      .catch(err => {
        debugger
      })
  }

  const postArticle = (article) => {
    axiosWithAuth().post(articlesUrl, article)
      .then(res => {
        setArticles([...articles, res.data.article])
      })
      .catch(err => {
        setMessage(err.response.data.message)
      })
  }

  const deleteArticle = article_id => {
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
  }

  const putArticle = (article_id) => {
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
              onSubmit={postArticle}
              article={articles.find(art => art.article_id === currentArticleId)}
            />
            <Articles
              deleteArticle={deleteArticle}
              getArticles={getArticles}
              updateArticle={putArticle}
              articles={articles}
            />
          </>
        } />
      </Routes>
    </React.StrictMode>
  )
}
