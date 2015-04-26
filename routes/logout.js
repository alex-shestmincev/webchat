exports.post = function(req, res){
  console.log(123);
  req.session.destroy();
  res.redirect('/');
};