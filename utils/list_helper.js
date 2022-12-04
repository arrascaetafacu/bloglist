const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => sum + blog.likes
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null
  let favorite = blogs[0]
  blogs.forEach(blog => {
    if (blog.likes > favorite.likes) favorite = blog
  })

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  let authors = []
  let blogsPerAuthor = {}
  blogs.forEach(blog => {
    if (!authors.includes(blog.author)) {
      authors.push(blog.author)
      blogsPerAuthor[blog.author] = 1
    } else {
      blogsPerAuthor[blog.author] += 1
    }
  })

  let mostBlogs = 0
  let mostBlogAuthor = null

  for (let author of authors) {
    if (blogsPerAuthor[author] > mostBlogs) {
      mostBlogs = blogsPerAuthor[author]
      mostBlogAuthor = author
    }
  }

  return {
    author: mostBlogAuthor,
    blogs: mostBlogs
  }
  
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs
}