const dummy = (blogs) => (blogs ? 1 : 1)

const totalLikes = (blogs) => blogs.reduce((previous, current) => {
  const result = previous + current.likes
  return result
}, 0)

const favouriteBlog = (blogs) => {
  const result = [...blogs].sort((a, b) => b.likes - a.likes)

  return result[0]
}

const mostBlogs = (blogs) => {
  const blogCount = {}

  blogs.forEach((blog) => {
    if (blogCount[blog.author]) {
      blogCount[blog.author] += 1
    } else {
      blogCount[blog.author] = 1
    }
  })

  const sortedAuthors = Object.entries(blogCount).sort((a, b) => b[1] - a[1])

  return {
    author: sortedAuthors[0][0],
    blogs: sortedAuthors[0][1],
  }
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs,
}
