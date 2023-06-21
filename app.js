require('dotenv').config();
const db = require("./db.js");
db.init();
var express = require('express'),
    app = express(),
    session = require('express-session');

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

var slugify = require('slugify');
const { request } = require('express');

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

var auth = function (req, res, next) {
    if (req.session && req.session.user === "amy" && req.session.admin)
        return next();
    else
        return res.send(`You must be logged in first. <a href=\'/'>Home</a>`);
};

app.get('/', async (req, res) => {
    var perPage = 2;
    var total = await db.getPostcount();
    var pages = Math.ceil(total / perPage);

    var pageNumber = req.query.page || 1;
    console.log(pageNumber);

    var startFrom = (pageNumber - 1) * perPage;

    const articles = await db.getPostperpage(startFrom, perPage);

    if (req.session && req.session.user === "amy" && req.session.admin)
        res.render('site/index_admin', {
            "pages": pages,
            "articles": articles
        });
    else
        res.render('site/index', {
            "pages": pages,
            "articles": articles
        });

})

app.get('/about', (req, res) => {
    res.render('site/about');
})

app.get('/contact', (req, res) => {
    res.render('site/contact');
})

app.get('/add_post', auth, (req, res) => {
    res.render('site/add_post');
})

app.get('/login', (req, res) => {
    res.render('site/login');
})

app.post('/login', async (req, res) => {
    if (req.body.username === "amy" || req.body.password === "amyspw") {
        req.session.user = "amy";
        req.session.admin = true;
        //res.send(`Login SUCCESS <a href=\'/'>Home</a>`);
        res.redirect('/');
    } else {
        res.send(`Login failed <a href=\'/'>Home</a>`);
    }
})

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.send(`Logout success. <a href=\'/'>Home</a>`);
});

app.post('/new-post', async (req, res) => {
    console.log(req.body);
    let currentDate = new Date().toJSON().slice(0, 10);

    

    let article = ({
        title: req.body.title,
        detail: req.body.detail,
        slug: slugify(req.body.title, { remove: /[*+~.,()'"!:@]/g }),
        date: currentDate,
    })
    console.log(article);
    await db.addPost(article);
    res.redirect('/');
})

app.get('/articles/:slug', async (req, res) => {
    const slug = req.params.slug;
    const article = await db.getPost(slug);
    res.render('site/post.ejs', { article });
})

app.get('/deletepost/:id', async (req, res) => {
    var x = req.params.id;
    await db.deletePost(x);
    console.log(x);
    res.redirect('/');
})

app.post('/articles/:slug/comments' , async (req, res) => {

    var x = req.params.slug;
    //const article = await db.getPostByid(x);
    console.log(req.params.id);
    console.log(req.body.comment);
    const comment = ({
        author: 'anonim',
        comment: req.body.comment
    });
    //article.comments.push(comment);
    var result = await db.UpdatePost(x,comment);
    console.log(result);
    var article = await db.getPostBySlug(x);
    res.render('site/post.ejs', { article });
})

app.listen(3000, () => {
    console.log(`Example app listening on port 3000`)
})