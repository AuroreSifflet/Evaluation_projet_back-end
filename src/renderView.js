export const renderView = (req, res, next, view, locals) => {
  return res.render(view, locals, (err, html) => {
    if (err) {
      return next(err);
    }
    if (html) {
      return res.send(html);
    }
  });
};
