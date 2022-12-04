const jwt = require('jsonwebtoken')
const blog = require('../models/blog')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


const getTokenFrom = req => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    console.log(authorization)
    return authorization.substring(7)
  }

  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.title || !body.author) {
    return response.status(400).send({ error: 'title or author missing'} )
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) return response.status(401).send({ error: 'token missing or invalid'})

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) return response.status(401).send({ error: 'token missing or invalid'})
  
  const blogToRemove = await Blog.findById(request.params.id)
  if (decodedToken.id === blogToRemove.user.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).send({ error: 'blogs can only be deleted by the users who created them' })
  }

})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const changedBlog = await Blog
    .findByIdAndUpdate(request.params.id, { likes: body.likes }, { new: true, runValidators: true, context: 'query'} )
  
  response.json(changedBlog)
})

module.exports = blogsRouter