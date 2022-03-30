const yup = require('yup')
const jwt = require('jsonwebtoken')

const thisShouldBeSecret = 'shh'
const topics = ['JavaScript', 'React', 'Node']

let id, articles, getId

const reset = () => {
  id = 0
  getId = () => ++id
  articles = [
    {
      article_id: getId(),
      title: 'Closures',
      text: 'Blah blah closures',
      topic: topics[0],
    },
    {
      article_id: getId(),
      title: 'Hooks',
      text: 'Blah blah hooks',
      topic: topics[1],
    },
    {
      article_id: getId(),
      title: 'Express',
      text: 'Blah blah express',
      topic: topics[2],
    },
  ]
}
reset()

const userSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required('username is required')
    .min(3, 'username must be at least 3 characters long')
    .max(20, 'username must be at most 20 characters long'),
  password: yup
    .string()
    .required('password is required')
    .min(8, 'password must be at least 8 characters long')
    .max(20, 'password must be at most 20 characters long'),
})
const articleSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('title is required')
    .min(3, 'title must be at least 3 characters long')
    .max(50, 'title must be at most 50 characters long'),
  text: yup
    .string()
    .trim()
    .required('text is required')
    .min(1, 'text must be at least one character long')
    .max(200, 'text must be at most 200 characters long'),
  topic: yup
    .string()
    .required('topic is required')
    .oneOf(topics)
})

async function login(user) {
  try {
    const { username } = await userSchema.validate(user)
    const claims = {
      username,
      role: 'Learner',
      school: 'Bloomtech',
    }
    const token = jwt.sign(claims, thisShouldBeSecret, { expiresIn: '1h' })
    const payload = { message: `Welcome back, ${username}!`, token }
    return [200, payload]
  } catch (err) {
    return [422, { message: `Ouch: ${err.message}` }]
  }
}

async function checkToken(token) {
  return jwt.verify(token, thisShouldBeSecret)
}

async function getArticles(token) {
  try {
    const decoded = await checkToken(token)
    const payload = {
      message: `Hey ${decoded.username}! Here are your articles`,
      articles,
    }
    return [200, payload]
  } catch (err) {
    return [401, { message: `Ouch: ${err.message}` }]
  }
}

async function postArticle(token, article) {
  let decodedToken, validatedArticle, newArticle
  try {
    decodedToken = await checkToken(token)
  } catch (err) {
    return [401, { message: `Ouch: ${err.message}` }]
  }
  try {
    validatedArticle = await articleSchema.validate(article, { stripUnknown: true })
    newArticle = { article_id: getId(), ...validatedArticle }
    articles.push(newArticle)
  } catch (err) {
    return [422, { message: `Ouch: ${err.message}` }]
  }
  const payload = {
    message: `Well done, ${decodedToken.username}. Great article!`,
    article: newArticle,
  }
  return [201, payload]
}

async function updateArticle(token, article, article_id) {
  let decodedToken, validatedArticle
  try {
    decodedToken = await checkToken(token)
  } catch (err) {
    return [401, { message: `Ouch: ${err.message}` }]
  }
  if (!articles.find(art => art.article_id == article_id)) {
    return [404, { message: `Ouch: Article with article_id ${article_id} not found!` }]
  }
  try {
    validatedArticle = await articleSchema.validate(article, { stripUnknown: true })
  } catch (err) {
    return [422, { message: `Ouch: ${err.message}` }]
  }
  articles = articles.map(art => {
    return art.article_id == article_id ? { ...art, ...validatedArticle } : art
  })
  const payload = {
    message: `Hey ${decodedToken.username}! Great update!`,
    article: articles.find(art => art.article_id == article_id),
  }
  return [200, payload]
}

async function deleteArticle(token, article_id) {
  let decodedToken
  try {
    decodedToken = await checkToken(token)
  } catch (err) {
    return [422, { message: `Ouch: ${err.message}` }]
  }
  if (!articles.find(art => art.article_id == article_id)) {
    return [404, { message: `Ouch: Article with article_id ${article_id} not found!` }]
  }
  articles = articles.filter(art => {
    return art.article_id != article_id
  })
  const payload = {
    message: `Hey ${decodedToken.username}! Article ${article_id} was deleted!`,
  }
  return [200, payload]
}

module.exports = {
  login,
  postArticle,
  getArticles,
  updateArticle,
  deleteArticle,
  reset,
}
