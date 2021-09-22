const { UserInputError, AuthenticationError } = require('apollo-server');

const Post = require('../../models/Post');
const authorizeUser = require('../../util/authorize');

postResolvers = {
  Query: {
    async getAllPosts() {
      try {
        const posts = await Post.find().sort({createdAt: -1});
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error('Post not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    }
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = authorizeUser(context);
      // console.log(user);

      if (body.trim() === '') {
        throw new Error('Post body cannot be empty');
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString()
      });

      const savedPost = await newPost.save();

      return savedPost;
    },
    async deletePost(_, { postId }, context) {
      const user = authorizeUser(context);
      // console.log(user);

      try {
        const postToDelete = await Post.findById(postId);
        if (postToDelete.username === user.username) {
          await postToDelete.delete();
          return 'Post removed';
        } else {
          throw new AuthenticationError('Unable to delete');
        } 
      } catch (err) {
        throw new Error(err);
      }
    }
  }
}

module.exports = postResolvers;