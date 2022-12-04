const app = require('../app')
const supertest = require('supertest')
const Blog = require('../models/blog')


const api = supertest(app)

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  
  const blogs = initialBlogs.map(b => new Blog(b))
  const promiseArray = blogs.map(b => b.save())

  await Promise.all(promiseArray)

}, 100000)

test('all blogs are returned', async () => {
  const response = await api
    .get('/api/blogs/')
    .expect(200)
    .expect('Content-Type', /application\/json/)
  
  expect(response.body).toHaveLength(initialBlogs.length)
}, 100000)

test('a blog is created correctly', async () => {
  const blog = {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .send(blog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blogsAtEnd = await Blog.find({})
  const titles = blogsAtEnd.map(b => b.title)

  expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
  expect(titles).toContain('Type wars')
}, 100000)

test('blogs have property id', async () => {
  const response = await api.get('/api/blogs/')
  expect(response.body[0].id).toBeDefined()
}, 100000)

test('if like property is missing blog is saved with default value 0', async () => {
  const blog = {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
  }

  const response = await api.post('/api/blogs').send(blog)
  expect(response.body.likes).toBe(0)
}, 100000)

test('blogs without title or author are not saved to database', async () => {
  const blog = {
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 10
  }

  await api
    .post('/api/blogs')
    .send(blog)
    .expect(400)

  const blogsAtEnd = await Blog.find({})

  expect(blogsAtEnd).toHaveLength(initialBlogs.length)
}, 100000)

test('deleting a blog is done succesfully', async () => {
  const blogsAtStart = await Blog.find({})
  console.log('BLOGS RETURNED', blogsAtStart)
  const blogToRemove = blogsAtStart[0]
  await api
    .delete(`/api/blogs/${blogToRemove.id}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})
  expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).not.toContain(blogToRemove.title)
}, 100000)

test('updating likes is done correctly', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0]
  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: 70})

  const updatedBlog = await Blog.findById(blogToUpdate.id)
  expect(updatedBlog.likes).toBe(70)
}, 100000)

