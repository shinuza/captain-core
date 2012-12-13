module('Users')
test( "Creating", function() {
  post('http://localhost:8080/users', {name: 'cat'}, 201, {ok: true});
  post('http://localhost:8080/users', {name: 'dog'}, 201, {ok: true});
  get('http://localhost:8080/users', 200, [{name: 'dog'}, {name: 'cat'}]);
});

test("Reading", function() {
  get('http://localhost:8080/users', 200, [{name: 'dog'}, {name: 'cat'}]);
  get('http://localhost:8080/users/dog', 200, {name: 'dog'});
});

test( "Updating", function() {
  put('http://localhost:8080/users/dog', {type: 'Canis'}, 201, {ok: true});
  get('http://localhost:8080/users', 200, [{name: 'dog', type: 'Canis'}, {name: 'cat'}]);
});

test("Deleting", function() {
  del('http://localhost:8080/users/cat', 204);
  get('http://localhost:8080/users', 200, [{name: 'dog', type: 'Canis'}]);
});