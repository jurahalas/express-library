import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BookSchema = new Schema(
  {
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    summary: {type: String, required: true},
    isbn: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
  }
);

// Virtual for book's URL
class Book {
    get url(){
        return '/catalog/book/' + this._id
    }
}
BookSchema.loadClass(Book);
//Export model
module.exports = mongoose.model('Book', BookSchema);