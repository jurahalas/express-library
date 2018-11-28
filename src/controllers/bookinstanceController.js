import BookInstance from '../models/bookinstance';
import { body,validationResult } from 'express-validator/check';
import { sanitizeBody } from 'express-validator/filter';
import Book from '../models/book';
import async from "async";
import Genre from "../models/genre";

// Display list of all BookInstances.
exports.bookinstance_list = (req, res)=> {
  BookInstance.find()
    .populate('book')
    .exec( (err, list_bookinstances)=> {
      if (err) { return next(err); }
      // Successful, so render
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) =>{
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec( (err, bookinstance)=> {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
        const err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Book:', bookinstance:  bookinstance});
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next)=> {
  Book.find({},'title')
    .exec( (err, books)=> {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books});
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance(
      { book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({},'title')
        .exec( (err, books)=> {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next)=> {

      BookInstance
        .findById(req.params.id)
        .populate('book')
        .exec((err, bookinstance)=>{
          if (err) { return next(err); }
          if (bookinstance==null) { // No results.
            res.redirect('/catalog/bookinstances');
          }
          res.render('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance: bookinstance });
        })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next)=> {

  // Assume valid BookInstance id in field.
  BookInstance.findByIdAndRemove(req.body.id, function deleteBookInstance(err) {
    if (err) { return next(err); }
    // Success, so redirect to list of BookInstance items.
    res.redirect('/catalog/bookinstances');
  });

};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next)=> {

  async.parallel({
    bookinstance: (callback)=> {
      BookInstance.findById(req.params.id).populate('book').exec(callback)
    },
    books: (callback)=> {
      Book.find(callback)
    },

  }, (err, results)=> {
    if (err) { return next(err); }
    if (results.bookinstance==null) { // No results.
      var err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('bookinstance_form', { title: 'Update  BookInstance', book_list : results.books, selected_book : results.bookinstance.book._id, bookinstance:results.bookinstance });
  });

};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped/trimmed data and current id.
    const bookinstance = new BookInstance(
      { book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id
      });

    if (!errors.isEmpty()) {
      // There are errors so render the form again, passing sanitized values and errors.
      Book.find({},'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Update BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err,thebookinstance) {
        if (err) { return next(err); }
        // Successful - redirect to detail page.
        res.redirect(thebookinstance.url);
      });
    }
  }
];