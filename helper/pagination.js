const Product = require('../models/product');

const ITEMS_PER_PAGE = 2; // This is for number of products rendering at once to speed up the website.

exports.paginate = (req, res, next, viewRender, pageTitle, pagePath) => {
  // IMPORTANT: ADD '+' SIGN TO MAKE IT AN INTEGER!!!! 
  // Also, make it 1 as default because shop page doesn't have query when first entered.
  const page = +req.query.page || 1; // query is from the url after '?'. 
  let totalItems;
  Product.find() // static method given in the Mongoose documentation. Returns array
    // IMPORTANT NOTE: If my data is large, then instead of fetching all products, use .curse().next(), or limit the data retrieved.
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE) // skip x amount of results. 'page - 1' means skip the previous page when I move on to next page.
        .limit(ITEMS_PER_PAGE) // Limit the number of products rendering.
    })
    .then(products => {
      res.render(viewRender, {
        products: products,
        pageTitle: pageTitle,
        path: pagePath,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};