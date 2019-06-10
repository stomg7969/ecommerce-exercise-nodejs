// public folder does not run on the server, but will run in the client, the browser.
const deleteProduct = (clickedBtn) => {
  const prodId = clickedBtn.parentNode.querySelector('[name=productId]').value;
  const csrf = clickedBtn.parentNode.querySelector('[name=_csrf]').value;
  const prodElement = clickedBtn.closest('article');

  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(r => r.json())
    .then(r => prodElement.remove())
    // .remove() is not supported by IE browser. 
    // prodElement.parentNode.removeChild(prodElement) will work on all browsers.
    .catch(err => console.log(err))
};