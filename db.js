const {
  MongoClient,
  ServerApiVersion,
  mongodb,
  ObjectID
} = require("mongodb");

module.exports = {
  _instance: null,
  client: null,

  init: async function () {
    this.client = new MongoClient(process.env.MONGO_URI || '', {
      serverApi: ServerApiVersion.v1,
    });
    await this.client.connect();
  },

  async testMethod() {
    await this.client.db("blog").command({
      ping: 1
    });
  },

  async getAllPosts() {
    let col = this.client.db("blog");
    let result = await col.collection("posts").find().toArray();
    //let result = await (await col.collection("posts").find().toArray()).reverse();
    return result;
  },

  async getPost(slug) {
    let col = this.client.db("blog");
    let result = await col.collection("posts").findOne({ slug: slug });
    return result;
  },

  async getPostBySlug(slug) {
    let col = this.client.db("blog");
    let result = await col.collection("posts").findOne({ slug: slug });
    return result;
  },

  async getPostByid(id) {
    let col = this.client.db("blog");
    let result = await col.collection("posts").findOne({ _id:ObjectID(id) });
    return result;
  },

  async UpdatePost(id,comment) {
    let col = this.client.db("blog");
    let result = await col.collection("posts").updateOne({slug:id},{ $push: { comments: comment }});
    console.log("updatepost");
    return result;
  },

  async addPost(article) {
    let col = this.client.db("blog");
    let result = await col.collection("posts").insertOne(article, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
    });
    return result;
  },

  async deletePost(x) {
    var query = { slug: x };
    console.log("gelen id");
    console.log(x);
    console.log(query);
    let col = this.client.db("blog");
    let result = await col.collection("posts").deleteOne(query);
    return result;
  },

  async getPostcount() {
    let col = this.client.db("blog");
    let total = await col.collection("posts").count();
    console.log(total);
    return total;
  },

  async getPostperpage(startFrom, perPage) {
    let col = this.client.db("blog");
    let total = await col.collection("posts").find({})
      //.sort({ "id": -1 })
      .skip(startFrom)
      .limit(perPage)
      .toArray();
    
    return total;
  }

};