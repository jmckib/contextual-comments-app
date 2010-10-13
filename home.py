import logging
import os

from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app


class Comment(db.Model):
    """A contextual comment on an html block, such as a paragraph"""
    page = db.StringProperty(required=True)
    block_index = db.IntegerProperty(required=True)
    datetime = db.DateTimeProperty(auto_now_add=True, required=True)
    username = db.StringProperty(required=True)
    comment = db.TextProperty()


class CommentHandler(webapp.RequestHandler):
    def post(self):
        """Save a comment to the database"""
        comment = Comment(page=self.request.headers['Referer'],
                block_index=int(self.request.get('nodenum')),
                username=self.request.get('name'),
                comment=self.request.get('comment'))
        comment.put()
    def get(self):
        """Load all comments for a page and block index"""
        block_index = int(self.request.get('nodenum'))
        page = self.request.headers['Referer']
        query = Comment.all().filter("page = ", page).filter("block_index = ", block_index).order('-datetime')
        logging.info("Return query = %s" % [result.comment for result in query])
        path = os.path.join(os.path.dirname(__file__), 'comments.html')
        self.response.out.write(template.render(path, {'comments': query}))
        # self.response.out.write("page %s, index %d" % (page, block_index))

class MainPage(webapp.RequestHandler):
    def get(self):
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(open(path).read())

application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/comments', CommentHandler)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
